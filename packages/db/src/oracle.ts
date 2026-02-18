import type { DailyUTxOs, OracleUTxoWithDatumAndTimestamp } from "./sync/types"
import { logger } from "./utils/logger"

export function findOracleByTimestamp(
  timestamp: Date,
  oracleTxs: DailyUTxOs[],
): OracleUTxoWithDatumAndTimestamp | null {

  const targetIso = timestamp.toISOString()

  const oracleDaily = oracleTxs.find((oracle) =>
    oracle.startIso <= targetIso && 
    oracle.endIso >= targetIso
  )

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
    logger.warn(`No oracle entry found before timestamp ${targetIso}`)
    return null
  }

  return validEntry.value as OracleUTxoWithDatumAndTimestamp
}
