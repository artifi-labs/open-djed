import { Blockfrost } from "@open-djed/blockfrost"
import { env } from "../../../../lib/env"
import { getAssetTxsUpUntilSpecifiedTime, processPoolOracleTxs, registry } from "../../utils"
import { logger } from "../../../utils/logger"
import type { OrderedPoolOracleTxOs } from "../../types"

export interface BaseContext {
  blockfrost: Blockfrost
}

export interface PopulateContext extends BaseContext {
  preloaded: {
    orderedTxOs: OrderedPoolOracleTxOs[]
  }
}
export interface UpdateContext extends BaseContext {
  preloaded: {
    orderedTxOs: OrderedPoolOracleTxOs[]
  }
}

function buildBaseContext(): BaseContext {
  const blockfrost = new Blockfrost(
    env.BLOCKFROST_URL,
    env.BLOCKFROST_PROJECT_ID,
  )
  return { blockfrost }
}

export async function buildPopulateContext(): Promise<PopulateContext> {
  const base = buildBaseContext()
  logger.info("Fetching all Pool Txs. This may take a while...")
  const everyPoolTx = await base.blockfrost.getAssetTransactions({
    asset: registry.poolAssetId,
    order: "desc", // TODO: REMOVE THIS, MAX PAGES and count
  }).allPages({ maxPages: 1, count: 1 }).retry()
  

  logger.info("Fetching all Oracle Txs. This may take a while...")
  const everyOracleTx = await base.blockfrost.getAssetTransactions({
    asset: registry.oracleAssetId,
    order: "desc", // TODO: REMOVE THIS, MAX PAGES and count
  }).allPages({ maxPages: 1, count: 1 }).retry()

  logger.info("Processing Pool and Oracle Txs. This may take a while...")
  const orderedTxOs = await processPoolOracleTxs(everyPoolTx, everyOracleTx)

  return {
    ...base,
    preloaded: {
      orderedTxOs: orderedTxOs || []
    }
  }
}

export async function buildUpdateContext(timestamp: Date): Promise<UpdateContext> {
  if (!timestamp) {
    throw new Error("Timestamp is required to build update context")
  }

  const base = buildBaseContext()

  // TODO: ADD a setting or constant to specify how far back we want to look for updates
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  if (!yesterdayStr) throw new Error("Failed to compute yesterday's date string")
  const timestampStr = timestamp.toISOString().split("T")[0]
  if (!timestampStr) throw new Error("Failed to compute timestamp date string")

  if (timestampStr >= yesterdayStr) {
    // return if latest was less than 24h ago
    return {
      ...base,
      preloaded: {
        orderedTxOs: []
      }
    }
  }

  const newPoolTxs = await getAssetTxsUpUntilSpecifiedTime(
    registry.poolAssetId,
    timestampStr,
  )
  const newOracleTxs = await getAssetTxsUpUntilSpecifiedTime(
    registry.oracleAssetId,
    timestampStr,
  )

  const orderedTxOs = await processPoolOracleTxs(newPoolTxs, newOracleTxs)

  return {
    ...base,
    preloaded: {
      orderedTxOs: orderedTxOs || []
    }
  }
}