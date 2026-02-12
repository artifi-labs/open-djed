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
