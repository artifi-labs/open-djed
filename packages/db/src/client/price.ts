import { Prisma } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import type { Period, Tokens } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodPricesForToken = (token: Tokens, period?: Period) => {
  const startIso = period ? getStartIso(period) : undefined

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      token: string
      usdValue: bigint
      adaValue: bigint
    }[]
  >`
    SELECT
      id,
      timestamp,
      token,
      ("usdValue" / 1000000.0)::float AS "usdValue",
      ("adaValue" / 1000000.0)::float AS "adaValue"
    FROM "Price"
    WHERE token = ${token}
    ${startIso ? Prisma.sql`AND timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY timestamp ASC
  `
}

export const getPeriodPricesForAllTokens = (period?: Period) => {
  const startIso = period ? getStartIso(period) : undefined

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      token: Tokens
      usdValue: number
      adaValue: number
    }[]
  >`
    SELECT
      id,
      timestamp,
      token,
      ("usdValue" / 1000000.0)::float AS "usdValue",
      ("adaValue" / 1000000.0)::float AS "adaValue"
    FROM "Price"
    ${startIso ? Prisma.sql`WHERE timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY token ASC, timestamp ASC
  `
}

export async function getPeriodPricesGroupedByToken(period?: Period) {
  const rows = await getPeriodPricesForAllTokens(period)

  return rows.reduce<Record<Tokens, typeof rows>>(
    (acc, row) => {
      acc[row.token].push(row)
      return acc
    },
    {
      ADA: [],
      DJED: [],
      SHEN: [],
    },
  )
}

export const getPeriodPricesForAdaAndShen = (period?: Period) => {
  const startIso = period ? getStartIso(period) : undefined

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      token: "ADA" | "SHEN"
      usdValue: number
      adaValue: number
    }[]
  >`
    SELECT
      id,
      timestamp,
      token,
      ("usdValue" / 1000000.0)::float AS "usdValue",
      ("adaValue" / 1000000.0)::float AS "adaValue"
    FROM "Price"
    WHERE token IN ('ADA', 'SHEN')
    ${startIso ? Prisma.sql`AND timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY token ASC, timestamp ASC
  `
}

export async function getPeriodAdaShenPricesGrouped(period?: Period): Promise<
  Record<
    "ADA" | "SHEN",
    {
      id: number
      timestamp: Date
      token: "ADA" | "SHEN"
      usdValue: number
      adaValue: number
    }[]
  >
> {
  const rows = await getPeriodPricesForAdaAndShen(period)

  return rows.reduce(
    (acc, row) => {
      acc[row.token].push(row)
      return acc
    },
    {
      ADA: [],
      SHEN: [],
    } as Record<"ADA" | "SHEN", typeof rows>,
  )
}

export const getLatestPriceTimestamp = async () =>
  await prisma.price.aggregate({
    _max: {
      timestamp: true,
    },
  })

export const getPricesByTimestamp = (token: string, timestamp: Date) => {
  return prisma.$queryRaw<{
    id: number
    timestamp: Date
    token: string
    usdValue: bigint
    adaValue: bigint
    block: string
    slot: bigint
  }>`
    SELECT
      timestamp,
      token,
      ("usdValue" / 1000000.0)::float AS "usdValue",
      ("adaValue" / 1000000.0)::float AS "adaValue",
      block,
      slot
    FROM "Price"
    WHERE token = ${token}
      AND timestamp = ${timestamp}
    ORDER BY timestamp ASC
  `
}
