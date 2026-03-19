import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import {
  getStartIso,
  getValidDateRange,
  MS_PER_DAY,
  toUtcDayStart,
} from "../sync/utils"

export const getFeesEarningsByDateRange = async (
  startDate: Date,
  endDate: Date,
) => {
  const dateRange = getValidDateRange(startDate, endDate)
  if (!dateRange) return []

  return await prisma.aDAFeesEarnings.findMany({
    where: {
      timestamp: { gte: dateRange.rangeStart, lt: dateRange.rangeEndExclusive },
    },
    orderBy: [{ timestamp: "asc" }],
  })
}

export const getPeriodFeesEarnings = (period: Period) => {
  const startIso = getStartIso(period)

  return prisma.aDAFeesEarnings.findMany({
    where: {
      ...(startIso && { timestamp: { gte: startIso } }),
    },
    orderBy: {
      timestamp: "asc",
    },
  })
}

export const getLatestFeesEarnings = async () => {
  return await prisma.aDAFeesEarnings.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })
}

export const getLast60DaysFeesEarningsRate = async () => {
  const last60DaysFeesEarnings = await prisma.aDAFeesEarnings.findMany({
    take: 60,
    orderBy: { timestamp: "desc" },
    select: { rate: true },
  })
  if (last60DaysFeesEarnings.length === 0) return 0

  const totalRate = last60DaysFeesEarnings.reduce(
    (acc, fee) => acc + Number(fee.rate ?? 0),
    0,
  )

  // data is stored in the db as percentage rate per day,
  // therefore we need to convert from percentage to decimal
  return totalRate / last60DaysFeesEarnings.length / 100
}

export const getSumFeesEarningsRate = async (
  startDate: Date,
  endDate: Date,
) => {
  const dateRange = getValidDateRange(startDate, endDate)
  if (!dateRange) return 0

  const [feesEarnings, last60DaysFeesEarningsRate] = await Promise.all([
    getFeesEarningsByDateRange(startDate, endDate),
    getLast60DaysFeesEarningsRate(),
  ])

  let totalGrowthFactor = 1

  feesEarnings.forEach((fee) => {
    const dailyDecimal = Number(fee.rate ?? 0) / 100
    totalGrowthFactor *= 1 + dailyDecimal
  })

  const totalDaysInRange = Math.max(
    0,
    (dateRange.rangeEndExclusive.getTime() - dateRange.rangeStart.getTime()) /
      MS_PER_DAY,
  )
  const daysWithData = new Set(
    feesEarnings.map((fee) =>
      toUtcDayStart(new Date(fee.timestamp)).toISOString(),
    ),
  ).size
  const missingDays = Math.max(0, totalDaysInRange - daysWithData)

  const projectedGrowth = Math.pow(1 + last60DaysFeesEarningsRate, missingDays)

  return totalGrowthFactor * projectedGrowth - 1
}

export const deleteAllFeesEarnings = async () => {
  const result = await prisma.aDAFeesEarnings.deleteMany()
  return result
}

export const deletePeriodFeesEarnings = async (period: Period) => {
  const startIso = getStartIso(period)

  await prisma.aDAFeesEarnings.deleteMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
  })
}
