import { prisma } from "../../lib/prisma"

export const getPeriodStakingRewards = (startDate: Date, endDate: Date) => {
  return prisma.aDAStakingRewards.findMany({
    where: {
      startTimestamp: { lt: endDate },
      endTimestamp: { gt: startDate },
    },
    select: {
      id: true,
      epoch: true,
      startTimestamp: true,
      endTimestamp: true,
      rate: true,
    },
    orderBy: [{ epoch: "asc" }],
  })
}

export const getLatestStakingReward = () =>
  prisma.aDAStakingRewards.findFirst({
    orderBy: {
      epoch: "desc",
    },
  })

export const deleteAllStakingRewards = () =>
  prisma.aDAStakingRewards.deleteMany()
