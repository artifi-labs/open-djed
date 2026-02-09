import { Prisma } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodPricesForToken = (token: string, period?: Period) => {
  const startIso = period ? getStartIso(period) : undefined

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      token: string
      usdValue: bigint
      adaValue: bigint
      block: string
      slot: bigint
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
