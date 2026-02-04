import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodDjedMC = async (period: Period) => {
  const startIso = getStartIso(period)

  const rows = await prisma.marketCap.findMany({
    where: startIso
      ? { timestamp: { gte: startIso }, token: "DJED" }
      : undefined,
    orderBy: { timestamp: "asc" },
  })

  return rows.map((row) => ({
    timestamp: row.timestamp.toISOString().slice(0, 10),
    usdValue: row.usdValue,
    adaValue: row.adaValue,
    block: row.block,
    slot: Number(row.slot),
    token: "DJED",
  }))
}

export const getLatestDjedMC = async () => {
  const entry = await prisma.marketCap.findFirst({
    orderBy: {
      timestamp: "desc",
    },
    where: {
      token: "DJED",
    },
  })

  return entry
    ? {
        timestamp: entry.timestamp.toISOString().slice(0, 10),
        usdValue: entry.usdValue,
        adaValue: entry.adaValue,
        block: entry.block,
        slot: Number(entry.slot),
      }
    : undefined
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
