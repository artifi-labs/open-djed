import {
  djedADARate,
  Rational,
  shenADARate,
  shenUSDRate,
} from "@open-djed/math"
import { logger } from "../../../utils/logger"
import type {
  DailyTokenPriceUTxOsWithWeights,
  DailyUTxOs,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  TokenPrice,
  WeightedTokenPriceEntry,
} from "../../types"
import {
  breakIntoDays,
  MS_PER_DAY,
  processAnalyticsDataToInsert,
} from "../../utils"
import type { AllTokens } from "../../../../generated/prisma/enums"
import { prisma } from "../../../../lib/prisma"
import { handleAnalyticsUpdates } from "../updateAnalytics"
import { getLatestPriceTimestamp } from "../../../client/price"

/**
 * Assigns a millisecond-based weight to every UTxO by tracking the interval
 * until the next observation within the same day. Records the pool/oracle datum
 * that would back each interval so the token price can later be computed.
 * @param dailyChunks grouped entries per day emitted from `breakIntoDays`
 * @returns the same chunks enriched with weight, token prices, and datum references
 */
export const assignTimeWeightsToTokenPriceDailyUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyTokenPriceUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activePoolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activePoolEntry: OrderedPoolOracleTxOs | null = null
  let activeOracleEntry: OrderedPoolOracleTxOs | null = null

  return dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedTokenPriceEntry[] = dailyDayChunk.entries.map(
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
        currentEntry.djedUsdValue = 1n
        currentEntry.djedAdaValue = djedADARate(previousOracleDatum)
          .mul(1000000n)
          .toBigInt()
        currentEntry.adaAdaValue = 1n
        currentEntry.adaUsdValue = new Rational(
          previousOracleDatum.oracleFields.adaUSDExchangeRate,
        )
          .mul(1000000n)
          .toBigInt()
        currentEntry.shenAdaValue = shenADARate(
          previousPoolDatum,
          previousOracleDatum,
        )
          .mul(1000000n)
          .toBigInt()
        currentEntry.shenUsdValue = shenUSDRate(
          previousPoolDatum,
          previousOracleDatum,
        )
          .mul(1000000n)
          .toBigInt()
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
 * Reduces each day’s weighted entries into a single average token price
 * entry, skipping days with no coverage and keeping metadata such as the
 * block hash/slot from the last entry.
 * @param dailyChunks the weighted daily chunks that include time coverage
 * @returns the averaged daily token price rows that are persisted
 */
export const getTimeWeightedDailyTokenPrices = (
  dailyChunks: DailyTokenPriceUTxOsWithWeights[],
): Record<AllTokens, TokenPrice[]> => {
  const dailyTokenPrices: Record<AllTokens, TokenPrice[]> = {
    ADA: [],
    DJED: [],
    SHEN: [],
  }

  for (const chunk of dailyChunks) {
    let weightedDjedADASum = 0n
    let weightedAdaUSDSum = 0n
    let weightedShenUSDSum = 0n
    let weightedShenADASum = 0n
    let durationSum = 0n

    for (const entry of chunk.entries) {
      if (
        entry.adaAdaValue === undefined ||
        entry.adaUsdValue === undefined ||
        entry.djedAdaValue === undefined ||
        entry.djedUsdValue === undefined ||
        entry.shenAdaValue === undefined ||
        entry.shenUsdValue === undefined ||
        entry.weight <= 0
      )
        continue
      const duration = BigInt(entry.weight)
      durationSum += duration
      weightedDjedADASum += BigInt(entry.djedAdaValue) * duration
      weightedAdaUSDSum += BigInt(entry.adaUsdValue) * duration
      weightedShenADASum += BigInt(entry.shenAdaValue) * duration
      weightedShenUSDSum += BigInt(entry.shenUsdValue) * duration
    }

    if (durationSum === 0n) continue

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    const base = {
      timestamp: new Date(latestEntry.value.timestamp),
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
    }

    dailyTokenPrices.ADA.push({
      ...base,
      token: "ADA",
      adaValue: 1n,
      usdValue: weightedAdaUSDSum / BigInt(MS_PER_DAY),
    })
    dailyTokenPrices.DJED.push({
      ...base,
      token: "DJED",
      adaValue: weightedDjedADASum / BigInt(MS_PER_DAY),
      usdValue: 1n,
    })
    dailyTokenPrices.SHEN.push({
      ...base,
      token: "SHEN",
      adaValue: weightedShenADASum / BigInt(MS_PER_DAY),
      usdValue: weightedShenUSDSum / BigInt(MS_PER_DAY),
    })
  }

  return dailyTokenPrices
}

export async function processTokenPrices(orderedTxOs: OrderedPoolOracleTxOs[]) {
  const start = Date.now()
  logger.info(`=== Processing Token Prices ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)
  const weightedDailyTxOs = assignTimeWeightsToTokenPriceDailyUTxOs(dailyTxOs)
  const dailyTokenPrices = getTimeWeightedDailyTokenPrices(weightedDailyTxOs)

  const dataToInsert: TokenPrice[] = []

  for (const token of Object.keys(dailyTokenPrices) as AllTokens[]) {
    const tokenPrices = dailyTokenPrices[token]

    if (tokenPrices.length === 0) continue

    const processed = processAnalyticsDataToInsert(tokenPrices)

    dataToInsert.push(...processed)
  }

  logger.info(`Inserting ${dataToInsert.length} Token Prices into database...`)
  await prisma.price.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic Token Prices sync complete. Inserted ${dataToInsert.length} Token Prices`,
  )

  const end = Date.now() - start
  logger.info(
    `=== Processing Token Prices took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateTokenPrices() {
  const start = Date.now()
  logger.info(`=== Updating Token Prices ===`)
  const latestPrice = await getLatestPriceTimestamp()
  if (!latestPrice._max.timestamp) return
  await handleAnalyticsUpdates(latestPrice._max.timestamp, processTokenPrices)
  const end = Date.now() - start
  logger.info(
    `=== Updating Token Prices took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
