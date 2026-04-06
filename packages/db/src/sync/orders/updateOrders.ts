import { logger } from "../../utils/logger"
import { prisma } from "../../../lib/prisma"
import { updatePendingOrders } from "./pendingOrders"
import { rollback } from "./rollback"
import { syncNewOrders, updateLatestBlock } from "./newOrders"
import { updateFeesEarnings } from "./feesEarnings/updateFeesEarnings"

export async function updateOrders() {
  const start = Date.now()
  logger.info("=== Starting Order Update Process ===")

  try {
    await rollback()
    const completedPendingOrders = await updatePendingOrders()
    const {
      completedOrders: completedNewOrders,
      newOrders,
      latestSyncedBlock,
    } = await syncNewOrders()
    await updateFeesEarnings([...completedPendingOrders, ...completedNewOrders])

    if (latestSyncedBlock) {
      await updateLatestBlock(latestSyncedBlock, newOrders)
    }

    logger.info("=== Order Update Complete ===")
    const end = Date.now() - start
    logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
  } catch (error) {
    logger.error(error, "Error during order update:")
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
