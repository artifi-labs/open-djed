import { logger } from "../utils/logger"
import { config } from "../../lib/env"
import cron from "node-cron"
import { updateOrders } from "./orders/updateOrders"
import { isLocked, lock, unlock } from "./utils"
import { updateAnalytics } from "./analytics/updateAnalytics"

cron.schedule(config.CRON_SCHEDULE, async () => {
  if (isLocked()) {
    logger.info("Cron job already running, skipping...")
    return
  }

  lock()
  logger.info("Starting scheduled order update...")
  try {
    await Promise.all([updateAnalytics(), updateOrders()])
  } catch (error) {
    logger.error(error, "Cron job failed:")
  } finally {
    unlock()
  }
})

logger.info(
  `Order update cron job started. Running every ${config.CRON_SCHEDULE}`,
)

process.on("SIGINT", () => {
  logger.info("Shutting down cron job...")
  unlock()
  process.exit(0)
})
