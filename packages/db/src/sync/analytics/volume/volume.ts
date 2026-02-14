import { logger } from "../../../utils/logger"
import type { UTxO } from "../../types"
import {
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
  processBatch,
  registry,
} from "../../utils"

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

  // filter utxos to get only those that consumed and created a pool utxo and that spends a utxo with a order ticket
  const ordersThatChangedPool = everyOrderUTxO.filter(
    (utxo) =>
      utxo.inputs.some((input) =>
        input.amount.some((asset) => asset.unit === registry.orderAssetId),
      ) &&
      utxo.inputs.some((input) => input.address === registry.poolAddress) &&
      utxo.outputs.some((output) => output.address === registry.poolAddress),
  )

  const txTimeByHash = new Map(
    everyOrderTx.map((tx) => [tx.tx_hash, tx.block_time] as const),
  )

  const utxosWithTimestamp = ordersThatChangedPool.flatMap((utxo) => {
    const blockTime = txTimeByHash.get(utxo.hash)
    if (blockTime === undefined) return []

    return {
      ...utxo,
      block_time: new Date(blockTime * 1000).toISOString(),
    }
  })

  // const absolutePath = path.resolve("./utxosWithTimestamp.json")

  // const json = JSONbig.stringify(utxosWithTimestamp)

  // await fsPromises.writeFile(absolutePath, json, {
  //   encoding: "utf-8",
  // })

  // const absolutePath = path.resolve("./utxosWithTimestamp.json")

  // const raw = await fsPromises.readFile(absolutePath, "utf-8")
  // const utxosWithTimestamp = JSONbig.parse(raw) as {
  //   block_time: string
  //   hash: string
  //   inputs: Input[]
  //   outputs: Output[]
  // }[]

  const volumeData = utxosWithTimestamp
    .map((utxo) => {
      const poolInput = utxo.inputs.find(
        (input) => input.address === registry.poolAddress,
      )
      const poolOutput = utxo.outputs.find(
        (output) => output.address === registry.poolAddress,
      )

      if (!poolInput || !poolOutput) {
        logger.warn(`Transaction ${utxo.hash} missing pool input or output`)
        return null
      }
      
      const getAmount = (
        amounts: Array<{ unit: string; quantity: string }>,
        unit: string,
      ) => {
        return BigInt(amounts.find((a) => a.unit === unit)?.quantity || "0")
      }

      const djedInputAmount = getAmount(poolInput.amount, registry.djedAssetId)
      const djedOutputAmount = getAmount(
        poolOutput.amount,
        registry.djedAssetId,
      )
      const djedDelta = djedOutputAmount - djedInputAmount

      const shenInputAmount = getAmount(poolInput.amount, registry.shenAssetId)
      const shenOutputAmount = getAmount(
        poolOutput.amount,
        registry.shenAssetId,
      )
      const shenDelta = shenOutputAmount - shenInputAmount

      let operationType:
        | "mint_djed"
        | "burn_djed"
        | "mint_shen"
        | "burn_shen"
        | "unknown"
      let volume = 0n

      if (djedDelta > 0n) {
        operationType = "burn_djed"
        volume = djedDelta
      } else if (djedDelta < 0n) {
        operationType = "mint_djed"
        volume = -djedDelta
      } else if (shenDelta > 0n) {
        operationType = "burn_shen"
        volume = shenDelta
      } else if (shenDelta < 0n) {
        operationType = "mint_shen"
        volume = -shenDelta
      } else {
        operationType = "unknown"
      }

      const date = utxo.block_time.split("T")[0]

      return {
        tx_hash: utxo.hash,
        operationType,
        volume,
        date,
        timestamp: utxo.block_time,
      }
    })
    .filter(Boolean)

  const volumeByDay = volumeData.reduce(
    (acc, tx) => {
      if (!acc[tx.date]) {
        acc[tx.date] = {
          date: tx.date,
          djedMinted: 0n,
          djedBurned: 0n,
          shenMinted: 0n,
          shenBurned: 0n,
          totalTransactions: 0,
        }
      }

      const day = acc[tx.date]
      day.totalTransactions++

      switch (tx.operationType) {
        case "mint_djed":
          day.djedMinted += tx.volume
          break
        case "burn_djed":
          day.djedBurned += tx.volume
          break
        case "mint_shen":
          day.shenMinted += tx.volume
          break
        case "burn_shen":
          day.shenBurned += tx.volume
          break
      }

      return acc
    },
    {} as Record<
      string,
      {
        date: string
        djedMinted: bigint
        djedBurned: bigint
        shenMinted: bigint
        shenBurned: bigint
        totalTransactions: number
      }
    >,
  )

  // this only has the volumes for the days where txs were made
  // there are several days with no txs therefore there are several gaps
  const dailyVolumes = Object.values(volumeByDay)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      date: day.date,
      djedMinted: day.djedMinted.toString(),
      djedBurned: day.djedBurned.toString(),
      shenMinted: day.shenMinted.toString(),
      shenBurned: day.shenBurned.toString(),
      totalDjedVolume: (day.djedMinted + day.djedBurned).toString(),
      totalShenVolume: (day.shenMinted + day.shenBurned).toString(),
      totalTransactions: day.totalTransactions,
    }))

  // Fill the gaps with zero volume days
  const allDates = dailyVolumes.map((d) => d.date)
  const minDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime())),
  )
  const maxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime())),
  )

  const volumeMap = new Map(dailyVolumes.map((d) => [d.date, d]))

  const completeVolumes = []
  const currentDate = new Date(minDate)

  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split("T")[0]

    const existingData = volumeMap.get(dateStr)

    if (existingData) {
      completeVolumes.push(existingData)
    } else {
      completeVolumes.push({
        date: dateStr,
        djedMinted: "0",
        djedBurned: "0",
        shenMinted: "0",
        shenBurned: "0",
        totalDjedVolume: "0",
        totalShenVolume: "0",
        totalTransactions: 0,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  logger.info(
    `Filled data from ${minDate.toISOString().split("T")[0]} to ${maxDate.toISOString().split("T")[0]}`,
  )
  logger.info(
    `Total days: ${completeVolumes.length} (was ${dailyVolumes.length})`,
  )

  logger.info("Daily Volume Summary:")
  completeVolumes.forEach((day) => {
    logger.info(
      `${day.date}: ${day.totalTransactions} txs, Djed: ${day.totalDjedVolume}, Shen: ${day.totalShenVolume}`,
    )
  })
}
