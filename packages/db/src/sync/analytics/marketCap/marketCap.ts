import { logger } from "../../../utils/logger"
import { breakIntoDays, processAnalyticsDataToInsert } from "../../utils"
import { getLatestMarketCap } from "../../../client/marketCap"
import { handleAnalyticsUpdates } from "../updateAnalytics"
import { TokenMarketCap } from "../../../../generated/prisma/enums"
import { prisma } from "../../../../lib/prisma"
import {
  assignTimeWeightsToDailyMarketCapUTxOs,
  getTimeWeightedDailyMarketCap,
} from "./timeWeighting"
import type { OrderedPoolOracleTxOs } from "../../types"

const MARKET_CAP_TOKENS: { token: TokenMarketCap; label: string }[] = [
  { token: TokenMarketCap.DJED, label: "DJED" },
  { token: TokenMarketCap.SHEN, label: "SHEN" },
]

export async function processMarketCap(orderedTxOs: OrderedPoolOracleTxOs[]) {
  const start = Date.now()
  logger.info(`=== Processing Market Cap ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)

  const dataToInsert = []
  const weightedDailyTxOs = assignTimeWeightsToDailyMarketCapUTxOs(dailyTxOs)

  for (const { token, label } of MARKET_CAP_TOKENS) {
    const dailyMarketCaps = getTimeWeightedDailyMarketCap(
      weightedDailyTxOs,
      token,
    )

    if (dailyMarketCaps.length === 0) {
      logger.warn(`No daily ${label} market caps computed`)
      continue
    }

    logger.info(`Processing ${label} market cap data...`)
    const processed = processAnalyticsDataToInsert(dailyMarketCaps)
    dataToInsert.push(...processed)
  }

  if (dataToInsert.length === 0) {
    logger.warn("No market cap entries to insert")
    return
  }

  logger.info(
    `Inserting ${dataToInsert.length} market cap entries into database...`,
  )
  await prisma.marketCap.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic market cap sync complete. Inserted ${dataToInsert.length} market cap entries`,
  )

  const end = Date.now() - start
  logger.info(
    `=== Processing Market Cap took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateMarketCap() {
  const start = Date.now()
  logger.info(`=== Updating Market Cap ===`)
  const latestMarketCap = await getLatestMarketCap()
  if (!latestMarketCap) return
  await handleAnalyticsUpdates(latestMarketCap.timestamp, processMarketCap)
  const end = Date.now() - start
  logger.info(
    `=== Updating Market Cap took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
