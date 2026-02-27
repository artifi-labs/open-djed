import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodFeesEarnings = (period: Period) => {
  const startIso = getStartIso(period)

  return prisma.aDAFeesEarnings.findMany({
    where: {
      ...(startIso && { timestamp: { gte: startIso } }),
    },
    select: {
      id: true,
      timestamp: true,
      fee: true,
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

export const deleteAllFeesEarnings = async () => {
  const result = await prisma.aDAFeesEarnings.deleteMany()
  return result
}
