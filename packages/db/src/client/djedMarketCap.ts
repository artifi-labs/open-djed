import { prisma } from "../../lib/prisma"
import type { DjedMarketCap } from "../sync/types"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodDjedMC = async (
  period: Period,
): Promise<DjedMarketCap[]> => {
  const startIso = getStartIso(period)

  const rows = await prisma.marketCap.findMany({
    where: startIso
      ? { timestamp: { gte: startIso }, token: "DJED" }
      : undefined,
    orderBy: { timestamp: "asc" },
  })

  return rows.map((row) => ({
    timestamp: row.timestamp,
    usdValue: row.usdValue,
    adaValue: row.adaValue,
    block: row.block,
    slot: Number(row.slot),
    token: "DJED",
  }))
}

export const getLatestDjedMC = async () => {
  return await prisma.marketCap.findFirst({
    orderBy: {
      timestamp: "desc",
    },
    where: {
      token: "DJED",
    },
  })
}

export const deleteAllDjedMC = async () => {
  const result = await prisma.marketCap.deleteMany({
    where: {
      token: "DJED",
    },
  })
  return result
}

export const deletePeriodDjedMC = async (period: Period) => {
  const startIso = getStartIso(period)

  await prisma.marketCap.deleteMany({
    where: startIso
      ? { timestamp: { gte: startIso }, token: "DJED" }
      : undefined,
  })
}
