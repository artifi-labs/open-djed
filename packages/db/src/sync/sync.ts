import { logger } from "../utils/logger"
import { updateAnalytics } from "./analytics/updateAnalytics"
import {
  processShenYield,
  updateShenYield,
} from "./analytics/shenYield/shenYield"
import { getLatestShenYield } from "../client/shenYield"
import { updateOrders } from "./orders/updateOrders"
import { isLocked, lock, unlock } from "./utils"

export async function sync() {
  if (isLocked()) {
    logger.info("Sync job already running, skipping...")
    return
  }

  lock()
  logger.info("Starting scheduled order update...")
  try {
    await Promise.all([updateAnalytics(), updateOrders()])
    // FIXME:  Shen Yield depends on fees and staking rewards calculations
    const latestShenYield = await getLatestShenYield()
    if (!latestShenYield) {
      await processShenYield()
    } else {
      await updateShenYield()
    }
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
