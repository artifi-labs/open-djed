import { prisma } from "../../lib/prisma"

//get reserve ratio per period 1D, Month Year

export const getPeriodReserveRatio = async () => {}

export const getLatestReserveRatio = async () => {
  const latestReserveRatio = await prisma.reserveRatio.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  })

  return latestReserveRatio
}
