import { logger } from "../../../utils/logger"
import { prisma } from "../../../../lib/prisma"

import { populateDbWithHistoricReserveRatio } from "./initialSync"
import { getLatestReserveRatio } from "../../../client/reserveRatio"
import {
  getAssetTxsUpUntilSpecifiedTime,
  processReserveRatioTxs,
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

  await processReserveRatioTxs(newPoolTxs, newOracleTxs)

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
  if (
    latestReserveRatio &&
    new Date(latestReserveRatio.timestamp).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
  ) {
    // return if latest was less than 24h ago
    logger.info(
      "=== Latest reserve ratio is less than 24h old, skipping update ===",
    )
    return
  }
  if (latestReserveRatio) {
    // update reserve ratio with most recent data
    logger.info("=== Updating reserve ratio historical data ===")
    await updateReserveRatio(latestReserveRatio?.timestamp)
  }
  return
}
