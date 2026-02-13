import { reserveRatio } from "@open-djed/math"
import type {
  DailyReserveRatioUTxOsWithWeights,
  DailyUTxOs,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  ReserveRatio,
  WeightedReserveEntry,
} from "../../types"
import { MS_PER_DAY } from "../../utils"

/**
 * Assigns a millisecond-based weight to every UTxO by tracking the interval
 * until the next observation within the same day. Records the pool/oracle datum
 * that would back each interval so the reserve ratio can later be computed.
 * @param dailyChunks grouped entries per day emitted from `breakIntoDays`
 * @returns the same chunks enriched with weight, ratio, and datum references
 */
export const assignTimeWeightsToReserveRatioDailyUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyReserveRatioUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activePoolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activePoolEntry: OrderedPoolOracleTxOs | null = null
  let activeOracleEntry: OrderedPoolOracleTxOs | null = null

  return dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedReserveEntry[] = dailyDayChunk.entries.map(
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

      const candidatePoolDatum =
        previousPoolDatum ??
        (currentEntry.key === "pool" ? currentEntry.value.poolDatum : null)
      const candidateOracleDatum =
        previousOracleDatum ??
        (currentEntry.key === "oracle" ? currentEntry.value.oracleDatum : null)
      const candidatePoolEntry =
        previousPoolEntry ?? (currentEntry.key === "pool" ? currentEntry : null)
      const candidateOracleEntry =
        previousOracleEntry ??
        (currentEntry.key === "oracle" ? currentEntry : null)

      const currentTimestampMs = Date.parse(currentEntry.value.timestamp)
      const isLastEntry = index === timedEntries.length - 1
      const intervalStartMs = isLastEntry
        ? currentTimestampMs
        : previousTimestampMs
      const intervalEndMs = isLastEntry ? dayEndMs : currentTimestampMs
      const intervalStartIso = new Date(intervalStartMs).toISOString()
      const intervalEndIso = new Date(intervalEndMs).toISOString()

      if (
        candidatePoolDatum &&
        candidateOracleDatum &&
        candidatePoolEntry &&
        candidateOracleEntry
      ) {
        currentEntry.usedPoolDatum = candidatePoolDatum
        currentEntry.usedOracleDatum = candidateOracleDatum
        currentEntry.ratio = reserveRatio(
          candidatePoolDatum,
          candidateOracleDatum,
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
 * Reduces each day’s weighted entries into a single average reserve ratio
 * entry, skipping days with no coverage and keeping metadata such as the
 * block hash/slot from the last entry.
 * @param dailyChunks the weighted daily chunks that include time coverage
 * @returns the averaged daily reserve ratio rows that are persisted
 */
export const getTimeWeightedDailyReserveRatio = (
  dailyChunks: DailyReserveRatioUTxOsWithWeights[],
): ReserveRatio[] => {
  const dailyReserveRatios: ReserveRatio[] = []

  for (const chunk of dailyChunks) {
    let weightedSumNumber = 0
    let durationSum = 0n

    for (const entry of chunk.entries) {
      if (entry.ratio === undefined || entry.weight <= 0) continue
      const duration = BigInt(entry.weight)
      durationSum += duration
      weightedSumNumber += entry.ratio * Number(duration)
    }

    if (durationSum === 0n) continue

    const averageRatio = weightedSumNumber / MS_PER_DAY

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    dailyReserveRatios.push({
      timestamp: new Date(latestEntry.value.timestamp),
      reserveRatio: averageRatio,
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
    })
  }

  return dailyReserveRatios
}
