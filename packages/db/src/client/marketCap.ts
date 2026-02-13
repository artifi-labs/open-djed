import { type TokenMarketCap } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodMarketCap = async (
  period: Period,
  token: TokenMarketCap,
) => {
  const startIso = getStartIso(period)
  const rows = await prisma.marketCap.findMany({
    where: {
      token,
      ...(startIso ? { timestamp: { gte: startIso } } : {}),
    },
    select: {
      id: true,
      timestamp: true,
      usdValue: true,
      adaValue: true,
    },
    orderBy: [
      {
        timestamp: "asc",
      },
    ],
  })

  return rows
}

export const getLatestSyncedMarketCaps = async () => {
  const result = await prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      token: string
      usdValue: number
      adaValue: number
      block: number
      slot: number
    }[]
  >`
    SELECT *
    FROM "MarketCap"
    WHERE timestamp = (
      SELECT timestamp
      FROM "MarketCap"
      WHERE token IN ('DJED', 'SHEN')
      GROUP BY timestamp
      HAVING COUNT(DISTINCT token) = 2
      ORDER BY timestamp DESC
      LIMIT 1
    )
    AND token IN ('DJED', 'SHEN')
  `
  return result
}

export const getMarketCapByTimestamp = (
  token: TokenMarketCap,
  timestamp: Date,
) => {
  return prisma.marketCap.findFirst({
    where: {
      token,
      timestamp,
    },
    select: {
      id: true,
      timestamp: true,
      token: true,
      usdValue: true,
      adaValue: true,
      block: true,
      slot: true,
    },
    orderBy: {
      timestamp: "asc",
    },
  })
}

export const getLatestMarketCap = async (token?: TokenMarketCap) => {
  return await prisma.marketCap.findFirst({
    orderBy: {
      timestamp: "desc",
    },
    where: token ? { token } : {},
  })
}

export const deleteAllMarketCap = async (token: TokenMarketCap) => {
  const result = await prisma.marketCap.deleteMany({
    where: {
      token,
    },
  })
  return result
}

export const deletePeriodMarketCap = async (
  period: Period,
  token: TokenMarketCap,
) => {
  const startIso = getStartIso(period)

  await prisma.marketCap.deleteMany({
    where: startIso ? { timestamp: { gte: startIso }, token } : { token },
  })
}
