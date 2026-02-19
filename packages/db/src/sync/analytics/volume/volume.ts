import { OrderDatum, PoolDatum } from "@open-djed/data"
import { logger } from "../../../utils/logger"
import type {
  UTxO,
  TransactionData,
  UnprocessedVolumeData,
  Transaction,
  Volume,
  OrderVolume,
} from "../../types"
import {
  blockfrost,
  blockfrostFetch,
  fetchTransactionsFromAddress,
  getEveryResultFromPaginatedEndpoint,
  network,
  processAnalyticsDataToInsert,
  processBatch,
  registry,
} from "../../utils"
import { credentialToAddress, Data } from "@lucid-evolution/lucid"
import {
  djedADARate,
  Rational,
  shenADARate,
  shenUSDRate,
} from "@open-djed/math"
import type { Actions, AllTokens } from "../../../../generated/prisma/enums"
import { prisma } from "../../../../lib/prisma"
import { getLatestVolume } from "../../../client/volume"

const createZeroVolumeDay = (timestamp: string) => ({
  timestamp,
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
})

const processVolumeTxs = async (volumeOrderTx: Transaction[]) => {
  logger.info("Fetching UTxOs...")
  const everyOrderUTxO: UTxO[] = await processBatch(
    volumeOrderTx,
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
    volumeOrderTx,
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
          orderOutput: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      // decodes datum of the input
      // bc the output no longer is an order
      // and we dont know the datum structure
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
          `Error decoding input order datum for UTxO ${utxo.hash}, skipping:`,
        )
        return {
          orderDatum: null,
          poolDatum: null,
          orderOutput: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      // this verifies is the order was accomplished
      // by checkinbg if there is an output sent to the address
      // present in the input with the order ticket
      const orderOutput = utxo.outputs.filter(
        (output) => output.address === addrOrder,
      )
      if (!orderOutput) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          orderOutput: null,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }

      // gets the new pool output
      const poolOutput = utxo.outputs.find(
        (output) => output.address === registry.poolAddress,
      )
      if (!poolOutput || !poolOutput.data_hash) {
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          orderOutput,
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
          orderOutput,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      } catch (error) {
        logger.error(
          error,
          `Error decoding pool datum for UTxO ${utxo.hash}, skipping:`,
        )
        return {
          orderDatum: inputOrderDatum,
          poolDatum: null,
          orderOutput,
          timestamp: utxo.timestamp,
          block: utxo.block_hash,
          slot: utxo.block_slot,
        }
      }
    },
    10,
    500,
  )

  return orders.filter(
    (order) =>
      order.orderDatum !== null &&
      order.poolDatum !== null &&
      order.orderOutput !== null,
  )
}

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

const processVolumeData = (volumeData: UnprocessedVolumeData[]) => {
  const txVolumes: OrderVolume[] = volumeData
    .map((entry) => {
      if (!entry.orderDatum) return null

      const volume = getVolumeFromDatum(entry.orderDatum)
      if (!volume) return null

      return {
        ...volume,
        timestamp: entry.timestamp,
        poolDatum: entry.poolDatum,
        block: entry.block,
        slot: entry.slot,
        orderOutput: entry.orderOutput,
      }
    })
    .filter((tx): tx is NonNullable<typeof tx> => tx !== null)

  // check if an order was valid
  // If it was a mint order, the user receives the tokens asked
  // if canceled, the user receives lovelace.
  // If it was a burn order, the user receives lovelace
  // if canceled, the user receives the tokens back
  const validVolumes = txVolumes.filter((vol) => {
    if (vol.action === "Mint") {
      return vol.orderOutput?.some((output) =>
        output.amount.some(
          (amt) =>
            amt.unit ===
            (vol.token === "DJED"
              ? registry.djedAssetId
              : registry.shenAssetId),
        ),
      )
    } else {
      return vol.orderOutput?.some((output) =>
        output.amount.every((amt) => amt.unit === "lovelace"),
      )
    }
  })

  const txVolumesByDay: Record<
    string,
    {
      action: Actions
      token: Exclude<AllTokens, "ADA">
      usd: number
      ada: number
      slot: number
      block: string
      timestamp: string
    }[]
  > = {}

  for (const tx of validVolumes) {
    const date = tx.timestamp.split("T")[0] || tx.timestamp
    if (!txVolumesByDay[date]) txVolumesByDay[date] = []

    if (tx.token === "DJED") {
      const rate = djedADARate({
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      }).toNumber()

      txVolumesByDay[date].push({
        block: tx.block,
        slot: tx.slot,
        timestamp: tx.timestamp,
        action: tx.action,
        token: tx.token,
        usd: Number(tx.amount) / 1e6,
        ada: (Number(tx.amount) * rate) / 1e6,
      })

      continue
    }

    if (tx.token === "SHEN") {
      if (!tx.poolDatum) continue

      const adaRate = shenADARate(tx.poolDatum, {
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      }).toNumber()

      const usdRate = shenUSDRate(tx.poolDatum, {
        oracleFields: { adaUSDExchangeRate: tx.adaUsdRate },
      }).toNumber()

      txVolumesByDay[date].push({
        block: tx.block,
        slot: tx.slot,
        timestamp: tx.timestamp,
        action: tx.action,
        token: tx.token,
        ada: (Number(tx.amount) * adaRate) / 1e6,
        usd: (Number(tx.amount) * usdRate) / 1e6,
      })
    }
  }

  const volumeByDay = Object.entries(txVolumesByDay).map(([timestamp, txs]) => {
    const sum = (
      token: Exclude<AllTokens, "ADA">,
      action: Actions,
      currency: "usd" | "ada",
    ) =>
      txs
        .filter((tx) => tx.token === token && tx.action === action)
        .reduce((acc, tx) => acc + tx[currency], 0)

    const djedMintedUSD = sum("DJED", "Mint", "usd")
    const djedBurnedUSD = sum("DJED", "Burn", "usd")
    const shenMintedUSD = sum("SHEN", "Mint", "usd")
    const shenBurnedUSD = sum("SHEN", "Burn", "usd")
    const djedMintedADA = sum("DJED", "Mint", "ada")
    const djedBurnedADA = sum("DJED", "Burn", "ada")
    const shenMintedADA = sum("SHEN", "Mint", "ada")
    const shenBurnedADA = sum("SHEN", "Burn", "ada")

    const latestEntryDay = [...txs].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp),
    )[0]

    return {
      timestamp,
      block: latestEntryDay?.block,
      slot: latestEntryDay?.slot,
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
    }
  })

  const allDates = volumeByDay.map((d) => d.timestamp)
  const minDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime())),
  )
  const maxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime())),
  )
  const volumeMap = new Map(volumeByDay.map((d) => [d.timestamp, d]))

  const completeVolumes: Volume[] = []
  const currentDate = new Date(minDate)

  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    if (!dateStr) return
    completeVolumes.push(volumeMap.get(dateStr) ?? createZeroVolumeDay(dateStr))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return completeVolumes.map((v) => ({
    ...v,
    timestamp: new Date(v.timestamp),
  }))
}

const processVolumes = async (txs: Transaction[]) => {
  const start = Date.now()
  logger.info(`=== Processing Volumes ===`)

  const volumeData = await processVolumeTxs(txs)
  const processedVolumes = processVolumeData(volumeData)

  if (!processedVolumes) {
    logger.warn("Could not process data for volumes")
    return
  }

  const dataToInsert = processAnalyticsDataToInsert(processedVolumes)

  logger.info(`Inserting ${dataToInsert.length} Volumes into database...`)
  await prisma.volume.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic Volumes sync complete. Inserted ${dataToInsert.length} Volumes`,
  )
  const end = Date.now() - start
  logger.info(`=== Processing Volumes took sec: ${(end / 1000).toFixed(2)} ===`)
}

export async function handleInitialVolumeDbPopulation() {
  const everyOrderTx = await getEveryResultFromPaginatedEndpoint(
    `/addresses/${registry.orderAddress}/transactions`,
  )
  if (everyOrderTx.length === 0) {
    logger.info("No transactions found")
    return
  }

  await processVolumes(everyOrderTx)
}

export async function updateVolumes() {
  const start = Date.now()
  logger.info(`=== Updating Volumes ===`)

  const latestVolume = await getLatestVolume()
  if (!latestVolume) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  if (!yesterdayStr) return
  const timestampStr = latestVolume.timestamp.toISOString().split("T")[0]
  if (!timestampStr) return

  if (timestampStr >= yesterdayStr) {
    // return if latest was less than 24h ago
    logger.info(`=== Latest Volumes is less than 24h old, skipping update ===`)
    return
  }

  const syncedBlock = (await blockfrostFetch(
    `/blocks/${latestVolume.block}`,
  )) as {
    height: number
  }
  const txs = (await fetchTransactionsFromAddress(
    syncedBlock.height,
  )) as Transaction[]
  if (txs.length === 0) {
    logger.info("No new Volumes transactions since last sync")
    return
  }

  await processVolumes(txs)

  const end = Date.now() - start
  logger.info(`=== Updating Volumes took sec: ${(end / 1000).toFixed(2)} ===`)
}
