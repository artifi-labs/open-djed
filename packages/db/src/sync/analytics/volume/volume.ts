import { OrderDatum, PoolDatum } from "@open-djed/data"
import { logger } from "../../../utils/logger"
import type { Input, Output, UTxO, TransactionData } from "../../types"
import {
  blockfrost,
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
  network,
  processBatch,
  registry,
} from "../../utils"
import { credentialToAddress, Data } from "@lucid-evolution/lucid"
import path from "path"
import JSONbig from "json-bigint"
import fsPromises from "fs/promises"
import {
  djedADARate,
  Rational,
  shenADARate,
  shenUSDRate,
} from "@open-djed/math"
import type { Actions, AllTokens } from "../../../../generated/prisma/enums"

export async function volume() {
  const everyOrderTx = await getEveryResultFromPaginatedEndpoint(
    `/addresses/${registry.orderAddress}/transactions`,
  )

  if (everyOrderTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyOrderTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyOrderUTxO: UTxO[] = await processBatch(
    everyOrderTx,
    async (order) => {
      try {
        return (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
      } catch (error) {
        logger.error(error, `Error fetching UTxO for tx ${order.tx_hash}:`)
        throw error
      }
    },
    10,
    500,
  )

  logger.info(`Fetched UTxOs for ${everyOrderUTxO.length} transactions`)

  const ordersThatChangedPool = everyOrderUTxO.filter(
    (utxo) =>
      utxo.inputs.some((input) =>
        input.amount.some((asset) => asset.unit === registry.orderAssetId),
      ) &&
      utxo.inputs.some((input) => input.address === registry.poolAddress) &&
      utxo.outputs.some((output) => output.address === registry.poolAddress),
  )

  const txInfoEntries = await processBatch(
    everyOrderTx,
    async (tx) => {
      const txData = (await blockfrostFetch(
        `/txs/${tx.tx_hash}`,
      )) as TransactionData
      return [
        tx.tx_hash,
        {
          block_time: tx.block_time,
          block_hash: txData.block,
          block_slot: txData.slot,
        },
      ] as const
    },
    10,
    500,
  )

  const txInfoByHash = new Map(txInfoEntries)

  const utxosWithTimestamp = ordersThatChangedPool.flatMap((utxo) => {
    const txInfo = txInfoByHash.get(utxo.hash)
    if (txInfo === undefined) return []

    return {
      ...utxo,
      timestamp: new Date(txInfo.block_time * 1000).toISOString(),
      block_hash: txInfo.block_hash,
      block_slot: txInfo.block_slot,
    }
  })

  logger.info(`Found ${utxosWithTimestamp.length} UTxOs that changed the pool`)

  const orders = await processBatch(
    utxosWithTimestamp,
    async (utxo) => {
      const inputWithOrderTicket = utxo.inputs.find((input) =>
        input.amount.some((asset) => asset.unit === registry.orderAssetId),
      )
      if (!inputWithOrderTicket || !inputWithOrderTicket.data_hash) {
        return {
          orderDatum: null,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      let inputOrderDatum
      let addrOrder: string
      try {
        const rawDatum = await blockfrost.getDatum(
          inputWithOrderTicket.data_hash,
        )
        inputOrderDatum = Data.from(rawDatum, OrderDatum)
        addrOrder = credentialToAddress(
          network,
          { type: "Key", hash: inputOrderDatum.address.paymentKeyHash[0] },
          { type: "Key", hash: inputOrderDatum.address.stakeKeyHash[0][0][0] },
        )
      } catch (error) {
        logger.error(
          error,
          `Error decoding datum for UTxO ${utxo.hash}, skipping:`,
        )
        return {
          orderDatum: null,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      const orderOutput = utxo.outputs.find(
        (output) => output.address === addrOrder,
      )
      if (!orderOutput) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      const poolOutput = utxo.outputs.find(
        (output) => output.address === registry.poolAddress,
      )
      if (!poolOutput) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      if (!poolOutput.data_hash) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      try {
        const rawDatum = await blockfrost.getDatum(poolOutput.data_hash)
        const decodedDatum = Data.from(rawDatum, PoolDatum)
        return {
          orderDatum: inputOrderDatum,
          poolDatum: decodedDatum,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      } catch (error) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }
    },
    10,
    500,
  )

  const volumeData = orders.filter(
    (order) => order.orderDatum !== null && order.poolDatum !== null,
  )

  // const absolutePath = path.resolve("./volumeData.json")

  // const json = JSONbig.stringify(orders)

  // await fsPromises.writeFile(absolutePath, json, {
  //   encoding: "utf-8",
  // })

  // const absolutePath = path.resolve("./volumeData.json")

  // const raw = await fsPromises.readFile(absolutePath, "utf-8")
  // const volumeData = JSONbig.parse(raw) as {
  //   orderDatum: null | OrderDatum
  //   poolDatum: null | PoolDatum
  //   timestamp: string
  //   block: string
  //   slot: number
  //   orderOutput: Output | null
  // }[]

  logger.info(`volumeData: ${volumeData.length}`)

  const getVolumeFromDatum = (datum: OrderDatum) => {
    const adaUsdRate = new Rational(datum.adaUSDExchangeRate)
    const [actionName, values] = Object.entries(datum.actionFields)[0] ?? []

    if (!actionName || !values) {
      throw new Error("OrderDatum has no actionFields")
    }

    const action: Actions = actionName.startsWith("Mint") ? "Mint" : "Burn"

    const token: Exclude<AllTokens, "ADA"> | null = actionName.includes("SHEN")
      ? "SHEN"
      : actionName.includes("DJED")
        ? "DJED"
        : null

    if (!token) {
      logger.info(`Token null`)
      return null
    }

    const amount: bigint | null =
      "shenAmount" in values && typeof values.shenAmount === "bigint"
        ? BigInt(values.shenAmount)
        : "djedAmount" in values && typeof values.djedAmount === "bigint"
          ? BigInt(values.djedAmount)
          : null

    if (!amount) {
      logger.info(`Amount null`)
      return null
    }

    return { action, token, amount, adaUsdRate }
  }

  const txVolumes = volumeData
    .map((entry) => {
      if (!entry.orderDatum) return null

      const volume = getVolumeFromDatum(entry.orderDatum)
      if (!volume) return null

      return {
        ...volume,
        date: entry.timestamp.split("T")[0] || entry.timestamp,
        poolDatum: entry.poolDatum,
        block: entry.block,
        slot: entry.slot,
      }
    })
    .filter((tx): tx is NonNullable<typeof tx> => tx !== null)

  logger.info(`txVolumes: ${txVolumes.length}`)

  const txVolumesByDay: Record<
    string,
    {
      action: Actions
      token: Exclude<AllTokens, "ADA">
      usd: bigint
      ada: bigint
    }[]
  > = {}

  for (const tx of txVolumes) {
    const date = tx.date
    if (!txVolumesByDay[date]) txVolumesByDay[date] = []

    if (tx.token === "DJED") {
      const r = djedADARate({
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      })

      const rate = (r.numerator * 1000000n) / r.denominator

      const ada = tx.amount * rate
      const usd = tx.amount

      txVolumesByDay[date].push({
        action: tx.action,
        token: tx.token,
        usd,
        ada,
      })

      continue
    }

    if (tx.token === "SHEN") {
      if (!tx.poolDatum) continue

      const adaRate = shenADARate(tx.poolDatum, {
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      })

      const usdRate = shenUSDRate(tx.poolDatum, {
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      })

      txVolumesByDay[date].push({
        action: tx.action,
        token: tx.token,
        ada: tx.amount * adaRate.toBigInt(),
        usd: tx.amount * usdRate.toBigInt(),
      })
    }
  }

  logger.info(`txVolumesByDay: ${Object.entries(txVolumesByDay).length}`)

  const volumeByDay = Object.entries(txVolumesByDay).map(([date, txs]) => {
    const sum = (
      token: Exclude<AllTokens, "ADA">,
      action: Actions,
      field: "usd" | "ada",
    ) =>
      txs
        .filter((tx) => tx.token === token && tx.action === action)
        .reduce((acc, tx) => acc + Number(tx[field]), 0)

    const djedMintedUSD = sum("DJED", "Mint", "usd")
    const djedBurnedUSD = sum("DJED", "Burn", "usd")
    const shenMintedUSD = sum("SHEN", "Mint", "usd")
    const shenBurnedUSD = sum("SHEN", "Burn", "usd")
    const djedMintedADA = sum("DJED", "Mint", "ada")
    const djedBurnedADA = sum("DJED", "Burn", "ada")
    const shenMintedADA = sum("SHEN", "Mint", "ada")
    const shenBurnedADA = sum("SHEN", "Burn", "ada")

    return {
      date,
      djedMintedUSD,
      djedBurnedUSD,
      shenMintedUSD,
      shenBurnedUSD,
      djedMintedADA,
      djedBurnedADA,
      shenMintedADA,
      shenBurnedADA,
      totalDjedVolumeUSD: djedMintedUSD + djedBurnedUSD,
      totalShenVolumeUSD: shenMintedUSD + shenBurnedUSD,
      totalDjedVolumeADA: djedMintedADA + djedBurnedADA,
      totalShenVolumeADA: shenMintedADA + shenBurnedADA,
      totalVolumeUSD:
        djedMintedUSD + djedBurnedUSD + shenMintedUSD + shenBurnedUSD,
      totalVolumeADA:
        djedMintedADA + djedBurnedADA + shenMintedADA + shenBurnedADA,
      totalTransactions: txs.length,
    }
  })

  logger.info(`volumeByDay: ${volumeByDay.length}`)

  const allDates = volumeByDay.map((d) => d.date)
  const minDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime())),
  )
  const maxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime())),
  )
  const volumeMap = new Map(volumeByDay.map((d) => [d.date, d]))

  const zeroDay = (date: string) => ({
    date,
    djedMintedUSD: 0,
    djedBurnedUSD: 0,
    shenMintedUSD: 0,
    shenBurnedUSD: 0,
    djedMintedADA: 0,
    djedBurnedADA: 0,
    shenMintedADA: 0,
    shenBurnedADA: 0,
    totalDjedVolumeUSD: 0,
    totalShenVolumeUSD: 0,
    totalDjedVolumeADA: 0,
    totalShenVolumeADA: 0,
    totalVolumeUSD: 0,
    totalVolumeADA: 0,
    totalTransactions: 0,
  })

  const completeVolumes = []
  const currentDate = new Date(minDate)

  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    if (!dateStr) return
    completeVolumes.push(volumeMap.get(dateStr) ?? zeroDay(dateStr))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  logger.info("Daily Volume Summary:")
  logger.info({ completeVolumes })

  return completeVolumes
}
