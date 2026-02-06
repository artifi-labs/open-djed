import { Prisma } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { type Period, getStartIso } from "../sync/utils"

export const getPeriodReserveRatio = (period: Period) => {
  const startIso = getStartIso(period)

  return prisma.$queryRaw<
    {
      id: number
      timestamp: Date
      reserveRatio: number
    }[]
  >`
    SELECT
      id,
      timestamp,
      ("reserveRatio" * 100)::float AS "reserveRatio"
    FROM "ReserveRatio"
    ${startIso ? Prisma.sql`WHERE timestamp >= ${startIso}` : Prisma.empty}
    ORDER BY timestamp ASC
  `
}

export const getLatestReserveRatio = async () => {
  return await prisma.reserveRatio.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })
}

export const deleteAllReserveRatios = async () => {
  const result = await prisma.reserveRatio.deleteMany()
  return result
}

export const deletePeriodReserveRatio = async (period: Period) => {
  const startIso = getStartIso(period)

  await prisma.reserveRatio.deleteMany({
    where: startIso ? { timestamp: { gte: startIso } } : undefined,
  })
}
