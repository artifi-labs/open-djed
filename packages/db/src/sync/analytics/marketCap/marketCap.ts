import {
  djedADAMarketCap,
  djedUSDMarketCap,
} from "@open-djed/math/src/market-cap"
import { shenADARate, shenUSDRate } from "@open-djed/math/src/rate"
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
import type {
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
} from "../../types"

export type MarketCapCalculator = {
  UsdValue: (
    poolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"],
    oracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"],
  ) => number
  AdaValue: (
    poolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"],
    oracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"],
  ) => number
}

const createMarketCapProcessor = (
  token: TokenMarketCap,
  label: string,
  calculator: MarketCapCalculator,
) => {
  const processMarketCap = async (orderedTxOs: OrderedPoolOracleTxOs[]) => {
    const start = Date.now()
    logger.info(`=== Processing ${label} Market Cap ===`)
    const dailyTxOs = breakIntoDays(orderedTxOs)
    const weightedDailyTxOs = assignTimeWeightsToDailyMarketCapUTxOs(
      dailyTxOs,
      calculator,
    )
    const dailyMarketCaps = getTimeWeightedDailyMarketCap(
      weightedDailyTxOs,
      token,
    )

    if (dailyMarketCaps.length === 0) {
      logger.warn(`No daily ${label} market caps computed`)
    }

    logger.info(`Processing ${label} market cap data...`)

    const dataToInsert = processAnalyticsDataToInsert(dailyMarketCaps)

    logger.info(
      `Inserting ${dataToInsert.length} ${label} market cap entries into database...`,
    )
    await prisma.marketCap.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    })
    logger.info(
      `Historic ${label} market cap sync complete. Inserted ${dataToInsert.length} ${label} market cap entries`,
    )
    const end = Date.now() - start
    logger.info(
      `=== Processing ${label} Market Cap took sec: ${(end / 1000).toFixed(2)} ===`,
    )
  }

  const updateMarketCap = async () => {
    const start = Date.now()
    logger.info(`=== Updating ${label} Market Cap ===`)
    const latestMarketCap = await getLatestMarketCap(token)
    if (!latestMarketCap) return

    await handleAnalyticsUpdates(latestMarketCap.timestamp, processMarketCap)
    const end = Date.now() - start
    logger.info(
      `=== Updating ${label} Market Cap took sec: ${(end / 1000).toFixed(2)} ===`,
    )
  }

  return { processMarketCap, updateMarketCap }
}

const djedMarketCap: MarketCapCalculator = {
  UsdValue: (poolDatum) => djedUSDMarketCap(poolDatum).toNumber(),
  AdaValue: (poolDatum, oracleDatum) =>
    djedADAMarketCap(poolDatum, oracleDatum).toNumber(),
}

const shenMarketCap: MarketCapCalculator = {
  UsdValue: (poolDatum, oracleDatum) =>
    shenUSDRate(poolDatum, oracleDatum)
      .mul(poolDatum.shenInCirculation)
      .toNumber(),
  AdaValue: (poolDatum, oracleDatum) =>
    shenADARate(poolDatum, oracleDatum)
      .mul(poolDatum.shenInCirculation)
      .toNumber(),
}

const {
  processMarketCap: processDjedMarketCap,
  updateMarketCap: updateDjedMC,
} = createMarketCapProcessor(TokenMarketCap.DJED, "DJED", djedMarketCap)

const {
  processMarketCap: processShenMarketCap,
  updateMarketCap: updateShenMC,
} = createMarketCapProcessor(TokenMarketCap.SHEN, "SHEN", shenMarketCap)

export {
  processDjedMarketCap,
  updateDjedMC,
  processShenMarketCap,
  updateShenMC,
}
