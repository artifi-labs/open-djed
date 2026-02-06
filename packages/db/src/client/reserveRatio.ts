import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodReserveRatio = async (period: Period) => {
  const startIso = getStartIso(period)

  return await prisma.reserveRatio.findMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
    orderBy: { timestamp: "asc" },
  })
}

export const getLatestReserveRatio = async () => {
  return await prisma.reserveRatio.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })
}

export const deleteAllReserveRatios = async () => {
  const result = await prisma.reserveRatio.deleteMany()
  return result
}

export const deletePeriodReserveRatio = async (period: Period) => {
  const startIso = getStartIso(period)

  await prisma.reserveRatio.deleteMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
  })
}
