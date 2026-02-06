import { prisma } from "../../../../lib/prisma"
import { logger } from "../../../utils/logger"
import { rollbackReserveRatios } from "./rollbackReserveRatios"
import { syncReserveRatios } from "./updateReserveRatio"

export async function updateReserveRatios() {
  const start = Date.now()
  logger.info("=== Starting Reserve Ratio Update Process ===")

  try {
    await rollbackReserveRatios()
    await syncReserveRatios()
    logger.info("=== Reserve Ratio Update Complete ===")
    const end = Date.now() - start
    logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
  } catch (error) {
    logger.error(error, "Error during reserve ratio update:")
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
