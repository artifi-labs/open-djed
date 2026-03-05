import { logger } from "../../../../utils/logger"
import {
  blockfrostFetch,
  formatDayEndIso,
  formatDayIso,
  getAssetTxsUpUntilSpecifiedTime,
  getEveryResultFromPaginatedEndpoint,
  getUtcDayKey,
  MS_PER_DAY,
  processBatch,
  registry,
  withBlockTime,
} from "../../../utils"
import type {
  Amount,
  Block,
  DailyDexPriceUTxOsWithWeights,
  DailyUTxOs,
  DexTokenPrice,
  DexValuesWithDatumAndTimestamp,
  OracleUTxoWithDatumAndTimestamp,
  OrderedDexOracleTxOs,
  Transaction,
  TransactionData,
  UTxO,
  WeightedDexPriceEntry,
} from "../../../types"
import { Rational } from "@open-djed/math"

export const getDexDjedPrice = (amount: Amount[]) => {
  const adaAmt = Number(amount.find((amt) => amt.unit === "lovelace")?.quantity)
  const djedAmt = Number(
    amount.find((amt) => amt.unit === registry.djedAssetId)?.quantity,
  )
  return adaAmt / djedAmt
}

export const breakIntoDaysDexs = (
  entries: OrderedDexOracleTxOs[],
): DailyUTxOs[] => {
  const buckets = new Map<string, OrderedDexOracleTxOs[]>()
  for (const entry of entries) {
    const day = getUtcDayKey(entry.value.timestamp)
    let dayEntries = buckets.get(day)
    if (!dayEntries) {
      dayEntries = []
      buckets.set(day, dayEntries)
    }
    dayEntries.push(entry)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayEntries]) => ({
      day,
      startIso: formatDayIso(day),
      endIso: formatDayEndIso(day),
      entries: dayEntries.sort((a, b) =>
        a.value.timestamp.localeCompare(b.value.timestamp),
      ),
    }))
}

export const assignTimeWeightsToDexPriceDailyUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyDexPriceUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activeDexValue: DexValuesWithDatumAndTimestamp["djedPrice"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activeDexEntry: OrderedDexOracleTxOs | null = null
  let activeOracleEntry: OrderedDexOracleTxOs | null = null

  return dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedDexPriceEntry[] = dailyDayChunk.entries
      .filter((entry) => entry.key === "dex" || entry.key === "oracle")
      .map((entry) => ({
        ...entry,
        weight: 0,
      }))

    const dayStartMs = Date.parse(dailyDayChunk.startIso)
    const dayEndMs = Date.parse(dailyDayChunk.endIso)

    const gapStartMs =
      chunkIndex === 0
        ? dayStartMs
        : Math.max(previousDayLastTimestampMs ?? dayStartMs, dayStartMs)

    let previousTimestampMs = gapStartMs

    timedEntries.forEach((currentEntry, index) => {
      const previousDexValue = activeDexValue
      const previousOracleDatum = activeOracleDatum
      const previousDexEntry = activeDexEntry
      const previousOracleEntry = activeOracleEntry

      const currentTimestampMs = Date.parse(currentEntry.value.timestamp)
      const isLastEntry = index === timedEntries.length - 1
      const intervalStartMs = isLastEntry
        ? currentTimestampMs
        : previousTimestampMs
      const intervalEndMs = isLastEntry ? dayEndMs : currentTimestampMs
      const intervalStartIso = new Date(intervalStartMs).toISOString()
      const intervalEndIso = new Date(intervalEndMs).toISOString()

      if (
        previousDexValue &&
        previousOracleDatum &&
        previousDexEntry &&
        previousOracleEntry
      ) {
        currentEntry.usedDexValue = previousDexValue
        currentEntry.usedOracleDatum = previousOracleDatum
        currentEntry.usdValue =
          previousDexValue *
          new Rational(
            previousOracleDatum.oracleFields.adaUSDExchangeRate,
          ).toNumber()
        currentEntry.adaValue = previousDexValue
        currentEntry.period = {
          start: intervalStartIso,
          end: intervalEndIso,
        }
      }
      let duration = Math.max(0, currentTimestampMs - previousTimestampMs)

      if (index === timedEntries.length - 1) {
        duration = Math.max(0, dayEndMs - currentTimestampMs)
      }

      currentEntry.weight = duration
      previousTimestampMs = currentTimestampMs

      if (currentEntry.key === "dex") {
        activeDexValue = currentEntry.value.djedPrice
        activeDexEntry = currentEntry
      } else {
        activeOracleDatum = currentEntry.value.oracleDatum
        activeOracleEntry = currentEntry
      }
    })

    const lastEntry = timedEntries.at(-1)
    if (lastEntry) {
      previousDayLastTimestampMs = Date.parse(lastEntry.value.timestamp)
    }

    return {
      ...dailyDayChunk,
      entries: timedEntries,
    }
  })
}

export const getTimeWeightedDailyDexPrices = (
  dailyChunks: DailyDexPriceUTxOsWithWeights[],
): DexTokenPrice[] => {
  const dailyDexPrices: DexTokenPrice[] = []

  for (const chunk of dailyChunks) {
    let weightedUSDSum = 0
    let weightedADASum = 0
    let durationSum = 0n

    for (const entry of chunk.entries) {
      if (
        entry.adaValue === undefined ||
        entry.usdValue === undefined ||
        entry.weight <= 0
      )
        continue
      const duration = BigInt(entry.weight)
      durationSum += duration
      weightedUSDSum += entry.usdValue * Number(duration)
      weightedADASum += entry.adaValue * Number(duration)
    }

    if (durationSum === 0n) continue

    const averageUsd = weightedUSDSum / MS_PER_DAY
    const averageAda = weightedADASum / MS_PER_DAY

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    dailyDexPrices.push({
      timestamp: new Date(latestEntry.value.timestamp),
      usdValue: averageUsd,
      adaValue: averageAda,
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
    })
  }

  return dailyDexPrices
}

const calculateDexDailyPrices = (
  oracleValues: OracleUTxoWithDatumAndTimestamp[],
  dexValues: DexValuesWithDatumAndTimestamp[],
) => {
  const orderedMinswapOracleTxOs: OrderedDexOracleTxOs[] = [
    ...oracleValues.map((datum) => ({
      key: "oracle" as const,
      value: {
        oracleDatum: datum.oracleDatum,
        timestamp: datum.timestamp,
        block_hash: datum.block_hash,
        block_slot: datum.block_slot,
      },
    })),
    ...dexValues.map((out) => ({
      key: "dex" as const,
      value: {
        djedPrice: out.djedPrice,
        timestamp: out.timestamp,
        block_hash: out.block_hash,
        block_slot: out.block_slot,
      },
    })),
  ].sort((a, b) => (a.value.timestamp < b.value.timestamp ? -1 : 1))
  const dailyTxOs = breakIntoDaysDexs(orderedMinswapOracleTxOs)
  const weightedDailyTxOs = assignTimeWeightsToDexPriceDailyUTxOs(dailyTxOs)
  const dailyDexPrices = getTimeWeightedDailyDexPrices(weightedDailyTxOs)
  return dailyDexPrices
}

export async function minswapDjedPrices(
  oracleValues: OracleUTxoWithDatumAndTimestamp[],
) {
  // get the oldest oracle date, in order to avoid getting more txs than those needed
  // this way we can also ensure the regular updates
  // seeing that there will only be oracles since the latest updated block
  const oldestOracle = oracleValues.reduce((prev, current) => {
    return new Date(current.timestamp) < new Date(prev.timestamp)
      ? current
      : prev
  })

  const minswapTxs = await getAssetTxsUpUntilSpecifiedTime(
    registry.minswapDjedAdaAssetId,
    oldestOracle.timestamp,
  )

  const minswapUTxO: UTxO[] = await processBatch(
    minswapTxs,
    async (order) => {
      try {
        return (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
      } catch (error) {
        logger.error(error, `Error fetching UTxO for tx ${order.tx_hash}:`)
        throw error
      }
    },
    100,
    800,
  )

  const minswapPoolUTxOs = withBlockTime(
    minswapTxs,
    minswapUTxO,
    registry.minswapDjedAdaAssetId,
    registry.minswapAddress,
  )

  const minswapPoolOutputs: DexValuesWithDatumAndTimestamp[] =
    await processBatch(
      minswapPoolUTxOs,
      async (utxo) => {
        const tx = (await blockfrostFetch(
          `/txs/${utxo.tx_hash}`,
        )) as TransactionData
        return {
          djedPrice: getDexDjedPrice(utxo.amount),
          timestamp: new Date(utxo.blockTime * 1000).toISOString(),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      },
      100,
      800,
    )

  // const minswapPoolOutputs: DexValuesWithDatumAndTimestamp[] = []
  // const rl = readline.createInterface({
  //   input: fs.createReadStream("./minswap.json"),
  //   terminal: false,
  // })
  // for await (const line of rl) {
  //   const utxo = JSONbig.parse(line)
  //   minswapPoolOutputs.push(utxo)
  // }

  return calculateDexDailyPrices(oracleValues, minswapPoolOutputs)
}

export async function wingRidersDjedPrices(
  oracleValues: OracleUTxoWithDatumAndTimestamp[],
) {
  // get the oldest oracle date, in order to avoid getting more txs than those needed
  // this way we can also ensure the regular updates
  // seeing that there will only be oracles since the latest updated block
  const oldestOracle = oracleValues.reduce((prev, current) => {
    return new Date(current.timestamp) < new Date(prev.timestamp)
      ? current
      : prev
  })

  const block = (await blockfrostFetch(
    `/blocks/${oldestOracle.block_hash}`,
  )) as Block

  const wingridersTxs = await getEveryResultFromPaginatedEndpoint<Transaction>(
    `/addresses/${registry.wingridersAddress}/transactions`,
    block.height,
  )

  const wingridersUTxO: UTxO[] = await processBatch(
    wingridersTxs,
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

  const wingridersPoolUTxOs = withBlockTime(
    wingridersTxs,
    wingridersUTxO,
    registry.djedAssetId,
    registry.wingridersAddress,
  )

  const wingridersPoolOutputs = await processBatch(
    wingridersPoolUTxOs,
    async (utxo) => {
      const tx = (await blockfrostFetch(
        `/txs/${utxo.tx_hash}`,
      )) as TransactionData
      return {
        djedPrice: getDexDjedPrice(utxo.amount),
        timestamp: new Date(utxo.blockTime * 1000).toISOString(),
        block_hash: tx.block,
        block_slot: tx.slot,
      }
    },
    10,
    500,
  )

  // const absolutePath = path.resolve("./wingriders.json")
  // const raw = await fsPromises.readFile(absolutePath, "utf-8")
  // const wingridersPoolOutputs = JSONbig.parse(
  //   raw,
  // ) as DexValuesWithDatumAndTimestamp[]

  return calculateDexDailyPrices(oracleValues, wingridersPoolOutputs)
}
