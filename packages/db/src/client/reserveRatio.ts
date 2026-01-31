import { prisma } from "../../lib/prisma"
import type { ReserveRatio } from "../sync/types"

export type Period = "D" | "W" | "M" | "1Y" | "All"

const getStartIso = (period: Period): string | undefined => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (period) {
    case "D":
      return today.toISOString().slice(0, 10)
    case "W": {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return start.toISOString().slice(0, 10)
    }
    case "M": {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return start.toISOString().slice(0, 10)
    }
    case "1Y": {
      const start = new Date(today)
      start.setUTCFullYear(start.getUTCFullYear() - 1)
      return start.toISOString().slice(0, 10)
    }
    case "All":
      return undefined
  }
}

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
