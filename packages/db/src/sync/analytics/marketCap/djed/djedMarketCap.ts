import { prisma } from "../../../../../lib/prisma"
import { logger } from "../../../../utils/logger"
import { syncDjedMC } from "./updateDjedMarketCap"

export async function updateDjedMC() {
  const start = Date.now()
  logger.info("=== Starting DJED Market Cap Update Process ===")

  try {
    await syncDjedMC()
    logger.info("=== DJED Market Cap Update Complete ===")
    const end = Date.now() - start
    logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
  } catch (error) {
    logger.error(error, "Error during DJED Market Cap update:")
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
