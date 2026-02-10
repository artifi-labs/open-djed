import type { AllTokens } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import type { Period, Tokens } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodPricesForAllTokens = async (
  period?: Period,
  token?: Tokens,
) => {
  const startIso = period ? getStartIso(period) : undefined

  const entries = await prisma.tokenPrice.findMany({
    where: {
      ...(token && { token }),
      ...(startIso && { timestamp: { gte: startIso } }),
    },
    select: {
      id: true,
      timestamp: true,
      token: true,
      usdValue: true,
      adaValue: true,
    },
    orderBy: [{ token: "asc" }, { timestamp: "asc" }],
  })

  if (!token) {
    return entries.reduce<Record<Tokens, typeof entries>>(
      (acc, row) => {
        acc[row.token as Tokens].push(row)
        return acc
      },
      {
        ADA: [],
        DJED: [],
        SHEN: [],
      },
    )
  }
  return entries
}

export async function getPeriodAdaShenPrices(options?: {
  period?: Period
  token?: "ADA" | "SHEN"
  grouped?: boolean
}) {
  const { period, token, grouped = false } = options ?? {}
  const startIso = period ? getStartIso(period) : undefined

  const rows = await prisma.tokenPrice.findMany({
    where: {
      token: token ? token : { in: ["ADA", "SHEN"] },
      ...(startIso && { timestamp: { gte: startIso } }),
    },
    select: {
      id: true,
      timestamp: true,
      token: true,
      usdValue: true,
      adaValue: true,
    },
    orderBy: [{ token: "asc" }, { timestamp: "asc" }],
  })

  if (grouped || !token) {
    return rows.reduce(
      (acc, row) => {
        acc[row.token as "ADA" | "SHEN"].push(row)
        return acc
      },
      {
        ADA: [],
        SHEN: [],
      } as Record<"ADA" | "SHEN", typeof rows>,
    )
  }

  return rows
}

export const getLatestPriceTimestamp = async () =>
  await prisma.tokenPrice.aggregate({
    _max: {
      timestamp: true,
    },
  })

export const getPriceByTimestamp = (token: AllTokens, timestamp: Date) => {
  return prisma.tokenPrice.findFirst({
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
