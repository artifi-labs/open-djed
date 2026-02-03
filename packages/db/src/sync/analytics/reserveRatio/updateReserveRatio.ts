import { logger } from "../../../utils/logger"
import { prisma } from "../../../../lib/prisma"

import { populateDbWithHistoricReserveRatio } from "./initialSync"
import { getLatestReserveRatio } from "../../../client/reserveRatio"
import {
  getAssetTxsUpUntilSpecifiedTime,
  processReserveRatio,
  registry,
} from "../../utils"

async function updateReserveRatio(timestamp: string) {
  const start = Date.now()
  const newPoolTxs = await getAssetTxsUpUntilSpecifiedTime(
    registry.poolAssetId,
    timestamp,
  )
  const newOracleTxs = await getAssetTxsUpUntilSpecifiedTime(
    registry.oracleAssetId,
    timestamp,
  )

  await processReserveRatio(newPoolTxs, newOracleTxs)

  const end = Date.now() - start
  logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
}

/**
 * sync the database with the most recent reserve ratio averages
 * check every new block, within the safety margin, after the last sync, and get every new transaction
 * check the UTxOs of the new transactions and calculate the resereve ratios
 * @returns
 */
export async function syncReserveRatios() {
  logger.info("=== Syncing Reserve Ratios ===")

  const isDbPopulated = (await prisma.reserveRatio.count()) > 0
  if (!isDbPopulated) {
    // populate historic data if the database is empty
    logger.info("=== No reserve ratio data found. Populating database... ===")
    await populateDbWithHistoricReserveRatio()
    return
  }

  const latestReserveRatio = await getLatestReserveRatio()
  if (!latestReserveRatio) return

  // we only want to run the update once every 24h,
  // in order to get the data relative to the lates full day
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  if (!yesterdayStr) return

  if (latestReserveRatio.timestamp >= yesterdayStr) {
    // return if latest was less than 24h ago
    logger.info(
      "=== Latest reserve ratio is less than 24h old, skipping update ===",
    )
    return
  }

  logger.info("=== Updating reserve ratio historical data ===")
  await updateReserveRatio(latestReserveRatio?.timestamp)
}
