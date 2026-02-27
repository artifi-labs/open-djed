import { prisma } from "../../lib/prisma"

export const getPeriodFeesEarnings = (startDate: Date, endDate: Date) => {
  return prisma.ADAFeesEarnings.findMany({
    where: {
      startTimestamp: { lt: endDate },
      endTimestamp: { gt: startDate },
    },
    select: {
      id: true,
      epoch: true,
      startTimestamp: true,
      endTimestamp: true,
      value: true,
    },
    orderBy: [{ epoch: "asc" }],
  })
}

export const getLatestFeesEarnings = () =>
  prisma.ADAFeesEarnings.findFirst({
    orderBy: {
      epoch: "desc",
    },
  })

export const deleteAllFeesEarnings = () => prisma.ADAFeesEarnings.deleteMany()
