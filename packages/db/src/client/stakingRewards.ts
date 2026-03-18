import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import {
  getStartIso,
  toUtcDayStart,
  getValidDateRange,
  MS_PER_DAY,
} from "../sync/utils"

export const getStakingRewardsByDateRange = async (
  startDate: Date,
  endDate: Date,
) => {
  const dateRange = getValidDateRange(startDate, endDate)
  if (!dateRange) return []

  return await prisma.aDAStakingRewards.findMany({
    where: {
      timestamp: { gte: dateRange.rangeStart, lt: dateRange.rangeEndExclusive },
    },
    orderBy: [{ timestamp: "asc" }],
  })
}

export const getPeriodStakingRewards = async (period: Period) => {
  const startIso = getStartIso(period)
  return await prisma.aDAStakingRewards.findMany({
    where: {
      timestamp: { gte: startIso },
    },
    orderBy: [{ timestamp: "asc" }],
  })
}

export const getLatestStakingReward = () =>
  prisma.aDAStakingRewards.findFirst({
    orderBy: {
      epoch: "desc",
    },
  })

export const getLast12EpochsStakingRewardsRate = async () => {
  const last12DaysRewardsRate = await prisma.aDAStakingRewards.findMany({
    take: 12,
    orderBy: { epoch: "desc" },
    select: { rate: true },
  })
  if (last12DaysRewardsRate.length === 0) return 0

  const totalRate = last12DaysRewardsRate.reduce(
    (acc, reward) => acc + Number(reward.rate ?? 0),
    0,
  )

  // data is stored in the db as percentage rate per epoch
  // therefore we need to convert from percentage to decimal and
  // from epoch(approx. 5 days) to day
  // divides by 500 because
  // 100 (percentage -> decimal) and 5 (epoch -> daily)
  return last12DaysRewardsRate.length > 0
    ? totalRate / last12DaysRewardsRate.length / 500
    : 0
}

export const getSumStakingRewardsRate = async (
  startDate: Date,
  endDate: Date,
) => {
  const dateRange = getValidDateRange(startDate, endDate)
  if (!dateRange) return 0

  const [rewards, last12DaysRewardsRate] = await Promise.all([
    getStakingRewardsByDateRange(startDate, endDate),
    getLast12EpochsStakingRewardsRate(),
  ])

  let totalGrowthFactor = 1

  rewards.forEach((reward) => {
    const dailyDecimal = Number(reward.rate ?? 0) / 500
    totalGrowthFactor *= 1 + dailyDecimal
  })

  const totalDaysInRange = Math.max(
    0,
    (dateRange.rangeEndExclusive.getTime() - dateRange.rangeStart.getTime()) /
      MS_PER_DAY,
  )
  const daysWithData = new Set(
    rewards.map((reward) =>
      toUtcDayStart(new Date(reward.timestamp)).toISOString(),
    ),
  ).size
  const missingDays = Math.max(0, totalDaysInRange - daysWithData)

  //(1 + dailyRate) ^ missingDays
  const projectedGrowth = Math.pow(1 + last12DaysRewardsRate, missingDays)

  return totalGrowthFactor * projectedGrowth - 1
}

export const deleteAllStakingRewards = () =>
  prisma.aDAStakingRewards.deleteMany()
