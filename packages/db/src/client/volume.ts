import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodVolume = async (period: Period) => {
  const startIso = getStartIso(period)
  const rows = await prisma.volume.findMany({
    where: {
      ...(startIso ? { timestamp: { gte: startIso } } : {}),
    },
    orderBy: [
      {
        timestamp: "asc",
      },
    ],
  })

  return rows
}

export const getLatestVolume = async (validBlock = false) => {
  return prisma.volume.findFirst({
    where: validBlock ? { block: { not: null } } : undefined,
    orderBy: {
      timestamp: "desc",
    },
  })
}

export const deleteVolumesUntilLatestValidBlock = async () => {
  return prisma.$transaction(async (tx) => {
    const latestWithBlock = await tx.volume.findFirst({
      where: {
        block: { not: null },
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        timestamp: true,
      },
    })

    if (!latestWithBlock) return { deleted: 0 }

    const result = await tx.volume.deleteMany({
      where: {
        timestamp: {
          gte: latestWithBlock.timestamp,
        },
      },
    })

    return result
  })
}
