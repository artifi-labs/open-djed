import { prisma } from "../../../lib/prisma"
import { logger } from "../../utils/logger"
import type { OrderedPoolOracleTxOs } from "../types"
import {
  getAssetTxsUpUntilSpecifiedTime,
  getEveryResultFromPaginatedEndpoint,
  processPoolOracleTxs,
  registry,
} from "../utils"
import {
  processDjedMarketCap,
  updateDjedMC,
} from "./marketCap/djed/djedMarketCap"
import { rollbackDjedMC } from "./marketCap/djed/rollbackDjedMC"
import { rollbackTokenPrices } from "./price/rollbackTokenPrice"
import {
  processTokenPrices,
  updateTokenPrices,
} from "./price/updateTokenPrices"
import {
  processReserveRatio,
  updateReserveRatios,
} from "./reserveRatio/reserveRatio"
import { rollbackReserveRatios } from "./reserveRatio/rollbackReserveRatios"

type DbProcessor = {
  isEmpty: boolean
  populateDbProcessor: (orderedTxOs: OrderedPoolOracleTxOs[]) => Promise<void>
  updateDbProcessor: () => Promise<void>
}

async function handleRollbacks() {
  await Promise.all([
    rollbackReserveRatios(),
    rollbackDjedMC(),
    rollbackTokenPrices(),
  ])
}

// with this we can reuse the same data for every analytics process
// saving hundreds of thousands of requests
async function handlePopulateDb(toUpdate: DbProcessor[]) {
  if (toUpdate.every((item) => !item.isEmpty)) return
  const start = Date.now()
  logger.info("=== Populating Database ===")
  const everyPoolTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.poolAssetId}/transactions`,
  ) //txs from pool
  const everyOracleTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.oracleAssetId}/transactions`,
  ) //txs from oracle

  const orderedTxOs = await processPoolOracleTxs(everyPoolTx, everyOracleTx)
  if (!orderedTxOs) {
    logger.warn("No orderedTxOs produced — skipping DB population")
    return
  }

  // await writeOrderedTxOsToFile(orderedTxOs, "./orderedTxOs.json")

  // const orderedTxOs = await readOrderedTxOsFromFile("./orderedTxOs.json")
  // if (!orderedTxOs) {
  //   logger.warn("No orderedTxOs read from file — skipping DB population")
  //   return
  // }
  const end = Date.now() - start
  logger.info(
    `=== Fetching data to populate database took sec: ${(end / 1000).toFixed(2)} ===`,
  )

  await Promise.all(
    toUpdate
      .filter((config) => config.isEmpty)
      .map((config) => config.populateDbProcessor(orderedTxOs)),
  )
}

// TODO: find a smarter way to handle the updates,
// as it needs a more nuanced approach because even though they all update once a day
// they might not all have the same timestamp
async function handleUpdateDb(toUpdate: DbProcessor[]) {
  logger.info("=== Update Database ===")
  await Promise.all(
    toUpdate
      .filter((config) => !config.isEmpty)
      .map((config) => config.updateDbProcessor()),
  )
}

export async function handleAnalyticsUpdates(
  timestamp: Date,
  processor: (orderedTxOs: OrderedPoolOracleTxOs[]) => Promise<void>,
) {
  // we only want to run the update once every 24h,
  // in order to get the data relative to the lates full day
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  if (!yesterdayStr) return
  const timestampStr = timestamp.toISOString().split("T")[0]
  if (!timestampStr) return

  if (timestampStr >= yesterdayStr) {
    // return if latest was less than 24h ago
    logger.info(
      `=== Latest ${processor.name} is less than 24h old, skipping update ===`,
    )
    return
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
  if (!orderedTxOs) return

  await processor(orderedTxOs)
}

export async function updateAnalytics() {
  logger.info("=== Syncing Analytics ===")

  await handleRollbacks()

  const isReserveRatioEmpty = (await prisma.reserveRatio.count()) === 0
  const isDjedMCEmpty =
    (await prisma.marketCap.count({
      where: { token: "DJED" },
    })) === 0
  const isPriceEmpty = (await prisma.price.count()) === 0

  const toUpdate: DbProcessor[] = [
    {
      isEmpty: isReserveRatioEmpty,
      populateDbProcessor: processReserveRatio,
      updateDbProcessor: updateReserveRatios,
    },
    {
      isEmpty: isDjedMCEmpty,
      populateDbProcessor: processDjedMarketCap,
      updateDbProcessor: updateDjedMC,
    },
    {
      isEmpty: isPriceEmpty,
      populateDbProcessor: processTokenPrices,
      updateDbProcessor: updateTokenPrices,
    },
  ]

  // even though it may be rare, this might introduce race conditions.
  // We want to run these in parallel because handlePopulateDb takes several hours
  // to run due to the sheer volume of data fetched, therefore we do not want the update
  // to get stuck behind it.
  await Promise.all([handlePopulateDb(toUpdate), handleUpdateDb(toUpdate)])
}
