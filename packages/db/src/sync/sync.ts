import { logger } from "../utils/logger"
import { updateAnalytics } from "./analytics/updateAnalytics"
import { updateOrders } from "./orders/updateOrders"
import { isLocked, lock, unlock } from "./utils"

async function sync() {
  if (isLocked()) {
    logger.info("Sync job already running, skipping...")
    return
  }

  lock()
  logger.info("Starting scheduled order update...")
  try {
    await Promise.all([updateAnalytics(), updateOrders()])
  } catch (error) {
    logger.error(error, "Sync job failed:")
    unlock()
    process.exit(1)
  } finally {
    unlock()
    process.exit(0)
  }
}

await sync()
