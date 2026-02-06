import { logger } from "../utils/logger"
import { config } from "../../lib/env"
import cron from "node-cron"
import { unlock } from "./utils"
import { sync } from "./sync"

cron.schedule(config.CRON_SCHEDULE, async () => {
  await sync()
})

logger.info(
  `Order update cron job started. Running every ${config.CRON_SCHEDULE}`,
)

process.on("SIGINT", () => {
  logger.info("Shutting down cron job...")
  unlock()
  process.exit(0)
})
