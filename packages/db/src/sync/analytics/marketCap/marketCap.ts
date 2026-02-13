import { logger } from "../../../utils/logger"
import { breakIntoDays, processAnalyticsDataToInsert } from "../../utils"
import { getLatestMarketCap } from "../../../client/marketCap"
import { handleAnalyticsUpdates } from "../updateAnalytics"
import type { TokenMarketCap } from "../../../../generated/prisma/enums"
import { prisma } from "../../../../lib/prisma"
import {
  assignTimeWeightsToDailyMarketCapUTxOs,
  getTimeWeightedDailyMarketCap,
} from "./timeWeighting"
import type { MarketCap, OrderedPoolOracleTxOs } from "../../types"

export async function processMarketCap(orderedTxOs: OrderedPoolOracleTxOs[]) {
  const start = Date.now()
  logger.info(`=== Processing Market Cap ===`)
  const dailyTxOs = breakIntoDays(orderedTxOs)
  const weightedDailyTxOs = assignTimeWeightsToDailyMarketCapUTxOs(dailyTxOs)
  const dailyMarketCaps = getTimeWeightedDailyMarketCap(weightedDailyTxOs)

  const dataToInsert: MarketCap[] = []

  for (const token of Object.keys(dailyMarketCaps) as TokenMarketCap[]) {
    const tokenPrices = dailyMarketCaps[token]

    if (tokenPrices.length === 0) continue

    const processed = processAnalyticsDataToInsert(tokenPrices)

    dataToInsert.push(...processed)
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
