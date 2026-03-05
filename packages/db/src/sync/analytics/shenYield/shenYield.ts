import { prisma } from "../../../../lib/prisma"
import { getAllFeesEarnings } from "../../../client/feesEarnings"
import { getLatestShenYield } from "../../../client/shenYield"
import { getAllStakingRewards } from "../../../client/stakingRewards"
import { logger } from "../../../utils/logger"
import type {
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  ShenYieldEntry,
} from "../../types"
import {
  toDayString,
  // writeJsonToFile,
  buildDailyStakingRates,
} from "../../utils"
import { handleAnalyticsUpdates } from "../updateAnalytics"

export async function processShenYield(orderedTxOs: OrderedPoolOracleTxOs[]) {
  if (!orderedTxOs || orderedTxOs.length === 0) {
    logger.warn("No ordered TxOs provided for fees earnings calculation")
    return
  }

  const start = Date.now()
  logger.info("=== Processing Shen Yield ===")

  const poolEntries = orderedTxOs.filter(
    (entry): entry is { key: "pool"; value: PoolUTxoWithDatumAndTimestamp } =>
      entry.key === "pool",
  )

  const [stakingRewards, fees] = await Promise.all([
    getAllStakingRewards(),
    getAllFeesEarnings(),
  ])

  stakingRewards.sort(
    (a, b) =>
      new Date(a.startTimestamp).valueOf() -
      new Date(b.startTimestamp).valueOf(),
  )
  fees.sort(
    (a, b) => new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf(),
  )

  if (fees.length === 0) {
    logger.info("No fees available to compute Shen yield")
    return
  }

  // await writeJsonToFile(stakingRewards, "AllStakingRewards.json")
  // await writeJsonToFile(fees, "AllFees.json")

  // Transform every epoch (start/end/rate) into a day -> rate
  const stakingByDay = buildDailyStakingRates(
    stakingRewards.map((reward) => ({
      ...reward,
      rate: Number(reward.rate),
    })),
  )

  const reservePoolByDay = new Map<string, number>()
  // Record the total ADA reserves reported by the pool datum on each day
  for (const entry of poolEntries) {
    const day = toDayString(entry.value.timestamp)
    const reservePoolAda =
      Number(entry.value.poolDatum.adaInReserve) / 1_000_000
    if (!Number.isFinite(reservePoolAda) || reservePoolAda <= 0) continue
    reservePoolByDay.set(day, reservePoolAda)
  }

  const dailyYield: ShenYieldEntry[] = []
  for (const fee of fees) {
    const day = toDayString(fee.timestamp)
    const reserve = reservePoolByDay.get(day)
    if (!reserve || reserve <= 0) {
      logger.warn(`Missing reserve for day ${day}, skipping fee ${fee.id}`)
      continue
    }

    const feeAda = Number(fee.fee)
    if (!Number.isFinite(feeAda)) {
      logger.warn(`Invalid fee value for id ${fee.id}`)
      continue
    }

    const feePercent = (feeAda / reserve) * 100
    const stakingPercent = stakingByDay.get(day) ?? 0
    const totalYield = stakingPercent + feePercent

    dailyYield.push({
      timestamp: new Date(`${day}T00:00:00.000Z`),
      fee: feePercent,
      stakingRewards: stakingPercent,
      yield: totalYield,
      shenEquity: reserve,
      block: fee.block,
      slot: BigInt(fee.slot),
    })
  }

  // await writeJsonToFile(dailyYield, "dailyYield.json")

  if (dailyYield.length === 0) {
    logger.warn("No daily shen Yield computed")
    return
  }

  logger.info("Processing shen Yield data...")
  logger.info(
    `Inserting ${dailyYield.length} shen yield entries into database...`,
  )
  await prisma.shenYield.createMany({
    data: dailyYield.map((entry) => ({
      timestamp: entry.timestamp,
      yield: entry.yield,
      block: entry.block,
      slot: entry.slot,
    })),
    skipDuplicates: true,
  })

  const end = Date.now() - start
  logger.info(
    `=== Processing shen Yield took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateShenYield() {
  const start = Date.now()
  logger.info(`=== Updating Shen Yield ===`)
  const latestShenYield = await getLatestShenYield()
  if (!latestShenYield) return

  await handleAnalyticsUpdates(latestShenYield.timestamp, processShenYield)
  const end = Date.now() - start
  logger.info(
    `=== Updating shen Yield took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
