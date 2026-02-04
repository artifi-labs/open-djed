import { prisma } from "../../lib/prisma"
import type { ReserveRatio } from "../sync/types"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodReserveRatio = async (
  period: Period,
): Promise<ReserveRatio[]> => {
  const startIso = getStartIso(period)

  const rows = await prisma.reserveRatio.findMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
    orderBy: { timestamp: "asc" },
  })

  return rows.map((row) => ({
    timestamp: row.timestamp,
    reserveRatio: Number(row.reserveRatio),
    block: row.block,
    slot: Number(row.slot),
  }))
}

export const getLatestReserveRatio = async () => {
  const latestReserveRatio = await prisma.reserveRatio.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })

  return latestReserveRatio
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
