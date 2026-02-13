import { prisma } from "../../../../lib/prisma"
import { getLatestReserveRatio } from "../../../client/reserveRatio"
import { logger } from "../../../utils/logger"
import type { OrderedPoolOracleTxOs } from "../../types"
import { breakIntoDays, processAnalyticsDataToInsert } from "../../utils"
import { handleAnalyticsUpdates } from "../updateAnalytics"
import {
  assignTimeWeightsToReserveRatioDailyUTxOs,
  getTimeWeightedDailyReserveRatio,
} from "./timeWeighting"

export async function processReserveRatio(
  orderedTxOs: OrderedPoolOracleTxOs[],
) {
  const start = Date.now()
  logger.info(`=== Processing Reserve Ratio ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)
  const weightedDailyTxOs = assignTimeWeightsToReserveRatioDailyUTxOs(dailyTxOs)

  const dailyRatios = getTimeWeightedDailyReserveRatio(weightedDailyTxOs)

  if (dailyRatios.length === 0) {
    logger.warn("No daily reserve ratios computed")
  }

  logger.info("Processing reserve ratio data...")

  const dataToInsert = processAnalyticsDataToInsert(dailyRatios)

  logger.info(`Inserting ${dataToInsert.length} reserve ratio into database...`)
  await prisma.reserveRatio.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic reserve ratio sync complete. Inserted ${dataToInsert.length} reserve ratios`,
  )

  const end = Date.now() - start
  logger.info(
    `=== Processing Reserve Ratios took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateReserveRatios() {
  const start = Date.now()
  logger.info(`=== Updating Reserve Ratio ===`)
  const latestReserveRatio = await getLatestReserveRatio()
  if (!latestReserveRatio) return

  await handleAnalyticsUpdates(
    latestReserveRatio.timestamp,
    processReserveRatio,
  )
  const end = Date.now() - start
  logger.info(
    `=== Updating Reserve Ratio took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
