import { Prisma } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodDjedMC = (period: Period) => {
  const startIso = getStartIso(period)

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      usdValue: number
      adaValue: number
    }[]
  >`
    SELECT
      id,
      timestamp,
      ("usdValue" / 1000000.0)::float AS "usdValue",
      ("adaValue" / 1000000.0)::float AS "adaValue"
    FROM "MarketCap"
    WHERE token = 'DJED'
    ${startIso ? Prisma.sql`AND timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY timestamp ASC
  `
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
