import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodShenYield = async (period: Period) => {
  const startIso = getStartIso(period)
  return await prisma.shenYield.findMany({
    where: {
      timestamp: { gte: startIso },
    },
    select: {
      id: true,
      timestamp: true,
      yield: true,
    },
    orderBy: [{ timestamp: "asc" }],
  })
}

export const getLatestShenYield = () =>
  prisma.shenYield.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })

export const deleteAllShenYield = () => prisma.shenYield.deleteMany()
