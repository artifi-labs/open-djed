import { prisma } from "../../../../lib/prisma"
import { getAllFeesEarnings } from "../../../client/feesEarnings"
import { getLatestShenYield } from "../../../client/shenYield"
import { getAllStakingRewards } from "../../../client/stakingRewards"
import { logger } from "../../../utils/logger"
import type {
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
  ShenYield,
} from "../../types"
import { toDayString, buildDailyStakingRates } from "../../utils"
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

  if (fees.length === 0 && stakingRewards.length === 0) {
    logger.info("No fees or staking rewards available to compute Shen yield")
    return
  }

  const stakingByDay = buildDailyStakingRates(
    stakingRewards.map((reward) => ({
      ...reward,
      rate: Number(reward.rate),
    })),
  )

  const blockAndSlotByDay = new Map<string, { block: string; slot: bigint }>()
  for (const entry of poolEntries) {
    const day = toDayString(entry.value.timestamp)
    blockAndSlotByDay.set(day, {
      block: entry.value.block_hash,
      slot: BigInt(entry.value.block_slot),
    })
  }

  const feesByDay = new Map(
    fees.map((fee) => [
      toDayString(fee.timestamp),
      {
        rate: Number(fee.rate ?? 0),
        block: fee.block,
        slot: BigInt(fee.slot),
      },
    ]),
  )

  const dayKeys = [
    ...new Set([
      ...blockAndSlotByDay.keys(),
      ...feesByDay.keys(),
      ...stakingByDay.keys(),
    ]),
  ].sort()

  const dailyYield: ShenYield[] = []
  for (const day of dayKeys) {
    const dayBlockInfo = blockAndSlotByDay.get(day)
    const feeEntry = feesByDay.get(day)

    const feeDailyRateRaw = feeEntry?.rate ?? 0
    const feeDailyRate = Number.isFinite(feeDailyRateRaw) ? feeDailyRateRaw : 0
    const stakingDailyRate = Number.isFinite(stakingByDay.get(day))
      ? (stakingByDay.get(day) ?? 0) / 5 //Epoch days
      : 0

    const annualizedYield = (feeDailyRate + stakingDailyRate) * 365.25 //Leap Years
    const block = feeEntry?.block ?? dayBlockInfo?.block
    const slot = feeEntry?.slot ?? dayBlockInfo?.slot

    dailyYield.push({
      timestamp: new Date(`${day}T00:00:00.000Z`),
      yield: annualizedYield,
      block,
      slot,
    })
  }

  if (dailyYield.length === 0) {
    logger.warn("No daily shen Yield computed")
    return
  }

  logger.info("Processing shen Yield data...")
  logger.info(
    `Inserting ${dailyYield.length} shen yield entries into database...`,
  )
  await prisma.shenYield.createMany({
    data: dailyYield,
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
