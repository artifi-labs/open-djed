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
import { handleAnalyticsUpdates } from "../updateAnalytics"
import { getLatestPriceTimestamp } from "../../../client/price"
import { getDexsTokenPrices } from "./dexs/dexTokenPrice"
import { prisma } from "../../../../lib/prisma"
import { DEX_CONFIG } from "../../../dex.config"
import { normalizeDexKey } from "./dexs/utils"
import type { DexDjedAdaPriceFields } from "../../../types/dex"

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
        currentEntry.djedUsdValue = 1
        currentEntry.djedAdaValue = djedADARate(previousOracleDatum).toNumber()
        currentEntry.adaAdaValue = 1
        currentEntry.adaUsdValue = new Rational(
          previousOracleDatum.oracleFields.adaUSDExchangeRate,
        ).toNumber()
        currentEntry.shenAdaValue = shenADARate(
          previousPoolDatum,
          previousOracleDatum,
        ).toNumber()
        currentEntry.shenUsdValue = shenUSDRate(
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
    let weightedDjedADASum = 0
    let weightedAdaUSDSum = 0
    let weightedShenUSDSum = 0
    let weightedShenADASum = 0
    let durationSum = 0

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
      const duration = entry.weight
      durationSum += duration
      weightedDjedADASum += entry.djedAdaValue * duration
      weightedAdaUSDSum += entry.adaUsdValue * duration
      weightedShenADASum += entry.shenAdaValue * duration
      weightedShenUSDSum += entry.shenUsdValue * duration
    }

    if (durationSum === 0) continue

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
      adaValue: 1,
      usdValue: weightedAdaUSDSum / MS_PER_DAY,
    })
    dailyTokenPrices.DJED.push({
      ...base,
      token: "DJED",
      adaValue: weightedDjedADASum / MS_PER_DAY,
      usdValue: 1,
    })
    dailyTokenPrices.SHEN.push({
      ...base,
      token: "SHEN",
      adaValue: weightedShenADASum / MS_PER_DAY,
      usdValue: weightedShenUSDSum / MS_PER_DAY,
    })
  }

  return dailyTokenPrices
}

export async function processTokenPrices(orderedTxOs: OrderedPoolOracleTxOs[], latestPriceTimestamp?: Date) {
  const start = Date.now()
  logger.info(`=== Processing Token Prices ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)
  const weightedDailyTxOs = assignTimeWeightsToTokenPriceDailyUTxOs(dailyTxOs)
  const dailyTokenPrices = getTimeWeightedDailyTokenPrices(weightedDailyTxOs)

  const dataToInsert: TokenPrice[] = []

  const dexsPricesPerDay = await getDexsTokenPrices(dailyTxOs, latestPriceTimestamp)

  for (const token of Object.keys(dailyTokenPrices) as AllTokens[]) {
    const tokenPrices = dailyTokenPrices[token]

    if (tokenPrices.length === 0) continue

    const processed = processAnalyticsDataToInsert(tokenPrices).map((row) => {
      const dayKey = new Date(row.timestamp).toISOString().slice(0, 10)

      const dayEntry = dexsPricesPerDay.find(
        (e) => new Date(e.day).toISOString().slice(0, 10) === dayKey
      )

      if (token !== "DJED") {
        return row
      }

      const prices = dayEntry?.prices ?? []

      const dexFields = Object.keys(DEX_CONFIG).reduce(
        (acc, dexKey) => {
          const djedAdaPrice = prices.find(
            (p) => normalizeDexKey(p.dex) === normalizeDexKey(dexKey)
          )?.djedAda

          const djedUsdPrice = prices.find(
            (p) => normalizeDexKey(p.dex) === normalizeDexKey(dexKey)
          )?.djedUsd

          acc[`${dexKey}DjedAdaPrice` as keyof DexDjedAdaPriceFields] =
            Number(djedAdaPrice ?? 0)

          acc[`${dexKey}DjedUsdPrice` as keyof DexDjedAdaPriceFields] =
            Number(djedUsdPrice ?? 0)

          return acc
        },
        {} as DexDjedAdaPriceFields
      )

      return {
        ...row,
        ...dexFields,
      }
    })
    dataToInsert.push(...processed)
  }

  /*dexsPricesPerDay.forEach((dayEntry) => {
    logger.info(dayEntry)
  })*/

  const result = await prisma.tokenPrice.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic Token Prices sync complete. Inserted ${result.count} Token Prices from a total of ${dataToInsert.length} to insert.`,
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
  /*const testDateMs = Date.now() - 2 * 24 * 60 * 60 * 1000
  const testDate = new Date(testDateMs)
  console.log(testDate)
  console.log("Latest price timestamp:", latestPrice._max.timestamp)*/
  await handleAnalyticsUpdates(latestPrice._max.timestamp, processTokenPrices)
  const end = Date.now() - start
  logger.info(
    `=== Updating Token Prices took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
