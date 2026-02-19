import { prisma } from "../../lib/prisma"
import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"

export const getPeriodVolume = async (period: Period) => {
  const startIso = getStartIso(period)
  const rows = await prisma.volume.findMany({
    where: {
      ...(startIso ? { timestamp: { gte: startIso } } : {}),
    },
    select: {
      timestamp: true,
      djedMintedUSD: true,
      djedBurnedUSD: true,
      shenMintedUSD: true,
      shenBurnedUSD: true,
      djedMintedADA: true,
      djedBurnedADA: true,
      shenMintedADA: true,
      shenBurnedADA: true,
      totalDjedVolumeUSD: true,
      totalShenVolumeUSD: true,
      totalDjedVolumeADA: true,
      totalShenVolumeADA: true,
      totalVolumeUSD: true,
      totalVolumeADA: true,
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
  return await prisma.volume.findFirst({
    where: validBlock
      ? { block: { not: null }, slot: { not: null } }
      : undefined,
    orderBy: {
      timestamp: "desc",
    },
  })
}

export const deleteVolumesUntilLatestValidBlock = async () => {
  return await prisma.$transaction(async (tx) => {
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
