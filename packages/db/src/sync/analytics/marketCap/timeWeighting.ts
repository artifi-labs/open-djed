import { TokenMarketCap } from "../../../../generated/prisma/enums"
import {
  djedADAMarketCap,
  djedUSDMarketCap,
  shenADAMarketCap,
  shenUSDMarketCap,
} from "@open-djed/math/src/market-cap"
import { MS_PER_DAY } from "../../utils"
import type {
  DailyMarketCapUTxOsWithWeights,
  DailyUTxOs,
  MarketCap,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  WeightedMarketCapEntry,
} from "../../types"

export const assignTimeWeightsToDailyMarketCapUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyMarketCapUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activePoolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activePoolEntry: OrderedPoolOracleTxOs | null = null
  let activeOracleEntry: OrderedPoolOracleTxOs | null = null

  return dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedMarketCapEntry[] = dailyDayChunk.entries.map(
      (entry) => ({
        ...entry,
        weight: 0,
      }),
    )

    const dayStartMs = Date.parse(dailyDayChunk.startIso)
    const dayEndMs = Date.parse(dailyDayChunk.endIso)

    const gapStartMs =
      chunkIndex === 0
        ? dayStartMs
        : Math.max(previousDayLastTimestampMs ?? dayStartMs, dayStartMs)

    let previousTimestampMs = gapStartMs

    timedEntries.forEach((currentEntry, index) => {
      const previousPoolDatum = activePoolDatum
      const previousOracleDatum = activeOracleDatum
      const previousPoolEntry = activePoolEntry
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
        previousPoolDatum &&
        previousOracleDatum &&
        previousPoolEntry &&
        previousOracleEntry
      ) {
        currentEntry.usedPoolDatum = previousPoolDatum
        currentEntry.usedOracleDatum = previousOracleDatum

        currentEntry.djedUsdValue =
          djedUSDMarketCap(previousPoolDatum).toNumber()
        currentEntry.djedAdaValue = djedADAMarketCap(
          previousPoolDatum,
          previousOracleDatum,
        ).toNumber()
        currentEntry.shenUsdValue = shenUSDMarketCap(
          previousPoolDatum,
          previousOracleDatum,
        ).toNumber()
        currentEntry.shenAdaValue = shenADAMarketCap(
          previousPoolDatum,
          previousOracleDatum,
        ).toNumber()

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

      if (currentEntry.key === "pool") {
        activePoolDatum = currentEntry.value.poolDatum
        activePoolEntry = currentEntry
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

export const getTimeWeightedDailyMarketCap = (
  dailyChunks: DailyMarketCapUTxOsWithWeights[],
  token: TokenMarketCap,
): MarketCap[] => {
  const dailyMarketCaps: MarketCap[] = []

  for (const chunk of dailyChunks) {
    let weightedUSDSum = 0
    let weightedADASum = 0
    let durationSum = 0

    for (const entry of chunk.entries) {
      const usdValue =
        token === TokenMarketCap.DJED ? entry.djedUsdValue : entry.shenUsdValue
      const adaValue =
        token === TokenMarketCap.DJED ? entry.djedAdaValue : entry.shenAdaValue

      if (entry.weight <= 0 || usdValue === undefined || adaValue === undefined)
        continue
      const duration = entry.weight
      durationSum += duration
      weightedUSDSum += usdValue * duration
      weightedADASum += adaValue * duration
    }

    if (durationSum === 0) continue

    const averageUSDValue = weightedUSDSum / MS_PER_DAY
    const averageADAValue = weightedADASum / MS_PER_DAY

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    dailyMarketCaps.push({
      timestamp: new Date(latestEntry.value.timestamp),
      usdValue: averageUSDValue,
      adaValue: averageADAValue,
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
      token,
    })
  }

  return dailyMarketCaps
}
