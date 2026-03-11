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

  return prisma.aDAStakingRewards.findMany({
    where: {
      timestamp: { gte: dateRange.rangeStart, lt: dateRange.rangeEndExclusive },
    },
    orderBy: [{ timestamp: "asc" }],
  })
}

export const getPeriodStakingRewards = async (period: Period) => {
  const startIso = getStartIso(period)
  return prisma.aDAStakingRewards.findMany({
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

export const getAllStakingRewards = () => prisma.aDAStakingRewards.findMany()

export const getLast12DaysStakingRewardsRate = async () => {
  const last12DaysRewardsRate = await prisma.aDAStakingRewards.findMany({
    take: 12,
    orderBy: {
      epoch: "desc",
    },
    select: {
      rate: true,
    },
  })

  const totalRate = last12DaysRewardsRate.reduce(
    (acc, reward) => acc + Number(reward.rate ?? 0),
    0,
  )

  return last12DaysRewardsRate.length > 0
    ? totalRate / last12DaysRewardsRate.length
    : 0
}

export const getSumStakingRewardsRate = async (
  startDate: Date,
  endDate: Date,
) => {
  const dateRange = getValidDateRange(startDate, endDate)
  if (!dateRange) return []

  const [rewards, last12DaysRewardsRate] = await Promise.all([
    getStakingRewardsByDateRange(startDate, endDate),
    getLast12DaysStakingRewardsRate(),
  ])

  const realizedRateSum = rewards.reduce(
    (acc, reward) => acc + Number(reward.rate ?? 0),
    0,
  )
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
  const projectedStakingRewardsRate = missingDays * last12DaysRewardsRate
  const totalStakingRewardsRate = realizedRateSum + projectedStakingRewardsRate

  return totalStakingRewardsRate
}

export const deleteAllStakingRewards = () =>
  prisma.aDAStakingRewards.deleteMany()
