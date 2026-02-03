import { logger } from "../../../../utils/logger"
import { populateDbWithHistoricDjedMC } from "./initialSync"

/**
 * sync the database with the most recent DJED market cap averages
 * check every new block, within the safety margin, after the last sync, and get every new transaction
 * check the UTxOs of the new transactions and calculate the DJED market caps
 * @returns
 */
export async function syncDjedMC() {
  logger.info("=== Syncing DJED Market Caps ===")

  await populateDbWithHistoricDjedMC()
}
