import type { TokenMarketCap } from "../../../../generated/prisma/enums"
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

/**
 * Reduces each day’s weighted entries into a single average market cap
 * entry, skipping days with no coverage and keeping metadata such as the
 * block hash/slot from the last entry.
 * @param dailyChunks the weighted daily chunks that include time coverage
 * @returns the averaged daily market cap rows that are persisted
 */
export const getTimeWeightedDailyMarketCap = (
  dailyChunks: DailyMarketCapUTxOsWithWeights[],
): Record<TokenMarketCap, MarketCap[]> => {
  const dailyMarketCaps: Record<TokenMarketCap, MarketCap[]> = {
    DJED: [],
    SHEN: [],
  }

  for (const chunk of dailyChunks) {
    let weightedDjedUSDSum = 0
    let weightedDjedADASum = 0
    let weightedSHENUSDSum = 0
    let weightedSHENADASum = 0
    let durationSum = 0

    for (const entry of chunk.entries) {
      if (
        entry.weight <= 0 ||
        entry.djedUsdValue === undefined ||
        entry.djedAdaValue === undefined ||
        entry.shenUsdValue === undefined ||
        entry.shenAdaValue === undefined
      )
        continue
      const duration = entry.weight
      durationSum += duration
      weightedDjedUSDSum += entry.djedUsdValue * duration
      weightedDjedADASum += entry.djedAdaValue * duration
      weightedSHENUSDSum += entry.shenUsdValue * duration
      weightedSHENADASum += entry.shenAdaValue * duration
    }

    if (durationSum === 0) continue
    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    const base = {
      timestamp: new Date(latestEntry.value.timestamp),
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
    }
    dailyMarketCaps.DJED.push({
      ...base,
      token: "DJED",
      adaValue: weightedDjedADASum / MS_PER_DAY,
      usdValue: weightedDjedUSDSum / MS_PER_DAY,
    })
    dailyMarketCaps.SHEN.push({
      ...base,
      token: "SHEN",
      adaValue: weightedSHENADASum / MS_PER_DAY,
      usdValue: weightedSHENUSDSum / MS_PER_DAY,
    })
  }

  return dailyMarketCaps
}
