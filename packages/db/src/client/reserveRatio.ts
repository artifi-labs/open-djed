import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodReserveRatio = async (period: Period) => {
  const startIso = getStartIso(period)

  const rows = await prisma.reserveRatio.findMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
    orderBy: { timestamp: "asc" },
  })

  return rows.map((row) => ({
    timestamp: row.timestamp.toISOString().slice(0, 10),
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
    ? {
        timestamp: latestReserveRatio.timestamp.toISOString().slice(0, 10),
        reserveRatio: Number(latestReserveRatio.reserveRatio),
        block: latestReserveRatio.block,
        slot: Number(latestReserveRatio.slot),
      }
    : undefined
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
