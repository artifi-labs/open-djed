import {
  djedUSDMarketCap,
  djedADAMarketCap,
} from "@open-djed/math/src/market-cap"
import { prisma } from "../../../../../lib/prisma"
import { logger } from "../../../../utils/logger"
import type {
  DailyDjedMarketCapUTxOsWithWeights,
  DailyUTxOs,
  DjedMarketCap,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  WeightedDjedMarketCapEntry,
} from "../../../types"
import { breakIntoDays, MS_PER_DAY } from "../../../utils"
import { getLatestDjedMC } from "../../../../client/djedMarketCap"
import { handleAnalyticsUpdates } from "../../updateAnalytics"

/**
 * Assigns a millisecond-based weight to every UTxO by tracking the interval
 * until the next observation within the same day. Records the pool/oracle datum
 * that would back each interval so the market cap can later be computed.
 * @param dailyChunks grouped entries per day emitted from `breakIntoDays`
 * @returns the same chunks enriched with weight, market cap values, and datum references
 */
export const assignTimeWeightsToDailyDjedMCUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyDjedMarketCapUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activePoolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activePoolEntry: OrderedPoolOracleTxOs | null = null
  let activeOracleEntry: OrderedPoolOracleTxOs | null = null

  const returnArr = dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedDjedMarketCapEntry[] =
      dailyDayChunk.entries.map((entry) => ({
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
        currentEntry.usdValue = djedUSDMarketCap(previousPoolDatum).toBigInt()
        currentEntry.adaValue = djedADAMarketCap(
          previousPoolDatum,
          previousOracleDatum,
        ).toBigInt()
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

  return returnArr
}

/**
 * Reduces each day’s weighted entries into a single average market cap
 * entry, skipping days with no coverage and keeping metadata such as the
 * block hash/slot from the last entry.
 * @param dailyChunks the weighted daily chunks that include time coverage
 * @returns the averaged daily market cap rows that are persisted
 */
export const getTimeWeightedDailyDjedMC = (
  dailyChunks: DailyDjedMarketCapUTxOsWithWeights[],
): DjedMarketCap[] => {
  const dailyReserveRatios: DjedMarketCap[] = []

  for (const chunk of dailyChunks) {
    let weightedUSDSum = 0n
    let weightedADASum = 0n
    let durationSum = 0n

    for (const entry of chunk.entries) {
      if (
        entry.weight <= 0 ||
        entry.usdValue === undefined ||
        entry.adaValue === undefined
      )
        continue
      const duration = BigInt(entry.weight)
      durationSum += duration
      weightedUSDSum += BigInt(entry.usdValue) * duration
      weightedADASum += BigInt(entry.adaValue) * duration
    }

    if (durationSum === 0n) continue

    const averageUSDValue = weightedUSDSum / BigInt(MS_PER_DAY)
    const averageADAValue = weightedADASum / BigInt(MS_PER_DAY)

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    dailyReserveRatios.push({
      timestamp: new Date(latestEntry.value.timestamp),
      usdValue: averageUSDValue,
      adaValue: averageADAValue,
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
      token: "DJED",
    })
  }

  return dailyReserveRatios
}

export async function processDjedMarketCap(
  orderedTxOs: OrderedPoolOracleTxOs[],
) {
  const start = Date.now()
  logger.info(`=== Processing DJED Market Cap ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)
  const weightedDailyTxOs = assignTimeWeightsToDailyDjedMCUTxOs(dailyTxOs)
  const dailyDjedMC = getTimeWeightedDailyDjedMC(weightedDailyTxOs)

  if (dailyDjedMC.length === 0) {
    logger.warn("No daily DJED market caps computed")
  } else {
    logger.info({ dailyDjedMC }, "Daily DJED market caps")
  }

  logger.info("Processing DJED market cap data...")

  // if the current day was processed remove it, as the data is incomplete and should not be recorded
  dailyDjedMC.sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })
  if (
    dailyDjedMC[dailyDjedMC.length - 1]?.timestamp ===
    new Date().toISOString().split("T")[0]
  ) {
    dailyDjedMC.pop()
  }

  logger.info(`Inserting ${dailyDjedMC.length} reserve ratio into database...`)
  await prisma.marketCap.createMany({
    data: dailyDjedMC,
    skipDuplicates: true,
  })
  logger.info(
    `Historic reserve ratio sync complete. Inserted ${dailyDjedMC.length} reserve ratios`,
  )
  const end = Date.now() - start
  logger.info(
    `=== Processing DJED Market Cap took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateDjedMC() {
  const latestDjedMC = await getLatestDjedMC()
  if (!latestDjedMC) return

  await handleAnalyticsUpdates(latestDjedMC.timestamp, processDjedMarketCap)
}
