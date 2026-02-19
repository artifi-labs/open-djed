import type { DailyUTxOs, OracleUTxoWithDatumAndTimestamp } from "./sync/types"
import { logger } from "./utils/logger"

/**
 * Finds the most recent valid oracle UTxO entry for a given timestamp.
 *
 * The function first determines which oracle day range contains the provided
 * timestamp. It then searches that day's entries for the latest oracle entry
 * whose timestamp is less than or equal to the target timestamp.
 *
 * If no valid entry is found for that day, the function rolls back day by day
 * until a valid oracle entry is found or no previous days remain.
 *
 * @param timestamp - The target timestamp to resolve the oracle state for.
 * @param oracleTxs - Array of daily oracle UTxOs grouped by day range.
 *
 * @returns The latest valid {@link OracleUTxoWithDatumAndTimestamp} whose
 * timestamp is less than or equal to the provided timestamp,
 * or `null` if no suitable oracle entry is found.
 */
export function findOracleByTimestamp(
  timestamp: Date,
  oracleTxs: DailyUTxOs[],
): OracleUTxoWithDatumAndTimestamp | null {

  const targetIso = timestamp.toISOString()

  let oracleDailyIndex = oracleTxs.findIndex((oracle) =>
    oracle.startIso <= targetIso && 
    oracle.endIso >= targetIso
  )

  const initialIndex = oracleDailyIndex

  if (oracleDailyIndex === -1) {
    logger.warn(`No oracle found for timestamp ${targetIso}`)
    return null
  }
  
  while (oracleDailyIndex >= 0) {
    const oracleDaily = oracleTxs[oracleDailyIndex]
    if (!oracleDaily) {
      logger.warn(`No oracle found for timestamp ${targetIso}`)
      return null
    }

    const validEntry = oracleDaily.entries
      .filter(({ key, value }) => (key === "oracle" && value.timestamp <= targetIso))
      .reduce<(typeof oracleDaily.entries)[number] | null>(
        (latest, entry) =>
          !latest || entry.value.timestamp > latest.value.timestamp ? entry : latest,
        null,
      )

    if (!validEntry) {
      logger.warn(`No oracle entry found for timestamp ${targetIso} at oracle day ${oracleDaily.day}`)
      oracleDailyIndex -= 1
      continue
    }

    if (initialIndex !== oracleDailyIndex) {
      logger.warn(`Oracle entry found for timestamp ${targetIso} at oracle day ${oracleDaily.day}, after ${initialIndex - oracleDailyIndex} day(s) of rollback`)
    }

    return validEntry.value as OracleUTxoWithDatumAndTimestamp
  }

  logger.warn(`No oracle found for timestamp ${targetIso}`)
  return null
}
