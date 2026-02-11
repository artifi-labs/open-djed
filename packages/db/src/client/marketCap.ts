import { Prisma, type TokenMarketCap } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodMarketCap = (period: Period, token: TokenMarketCap) => {
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
    WHERE token = ${token}
    ${startIso ? Prisma.sql`AND timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY timestamp ASC
  `
}

export const getLatestMarketCap = async (token: TokenMarketCap) => {
  return await prisma.marketCap.findFirst({
    orderBy: {
      timestamp: "desc",
    },
    where: {
      token,
    },
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
