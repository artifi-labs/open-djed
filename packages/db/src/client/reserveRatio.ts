import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodReserveRatio = (period: Period) => {
  const startIso = getStartIso(period)

  return prisma.reserveRatio.findMany({
    where: {
      ...(startIso && { timestamp: { gte: startIso } }),
    },
    select: {
      id: true,
      timestamp: true,
      reserveRatio: true,
    },
    orderBy: {
      timestamp: "asc",
    },
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
