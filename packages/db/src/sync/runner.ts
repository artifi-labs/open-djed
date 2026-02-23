import { logger } from "../utils/logger"
import { historyScriptRegistry } from "./registry"
import { buildPopulateContext, buildUpdateContext } from "./sharedContext"

export async function runAllHistoryScripts() {

  logger.info("=== Running scripts to update History Tables ===")
  let populateContext = undefined
  let updateContext = undefined

  logger.info("=== Running rollbacks for all scripts ===")
  const rollbackScripts = await Promise.all(
    historyScriptRegistry.map((s) => s.rollback?.() ?? Promise.resolve())
  )
  if (!rollbackScripts.some(Boolean)) {
    logger.info("No scripts needed rollback.")
  } else {
    logger.info(`Scripts that needed rollback: ${historyScriptRegistry.filter((_, index) => rollbackScripts[index]).map(s => s.constructor.name).join(", ")}`)
  }

  logger.info("=== Checking which scripts need update ===")
  const scriptNeedsUpdate = await Promise.all(
    historyScriptRegistry.map(async (script) => script.needUpdate?.())
  )
  if (!scriptNeedsUpdate.some(Boolean)) {
    logger.info("No scripts need update, all will be populated.")
  } else {
    logger.info(`Scripts that need update: ${historyScriptRegistry.filter((_, index) => scriptNeedsUpdate[index]).map(s => s.constructor.name).join(", ")}`)
  }

  if (scriptNeedsUpdate.some(Boolean)) {
    const latestTimestamps = await Promise.all(
      historyScriptRegistry.map(async (script) => await script.latestTimestamp?.())
    )

    if (latestTimestamps.length > 0) {
      const validTimestamps = latestTimestamps.filter((timestamp) => timestamp !== undefined)
      const oldestTimestamp = new Date(
        Math.min(...validTimestamps.map((timestamp) => timestamp.getTime()))
      )
      logger.info(`Oldest timestamp among scripts that need update: ${oldestTimestamp.toISOString()}`)

      logger.info("=== Building update context ===")
      updateContext = await buildUpdateContext(oldestTimestamp)
    } else {
      throw new Error("No valid timestamps found for scripts that need update. Cannot build update context.")
    }

  } else {
    logger.info("=== Building populate context ===")
    populateContext = await buildPopulateContext()
  }

  for (const script of historyScriptRegistry) {
    logger.info(`=== Running script ${script.constructor.name} ===`)

    try {
      await script.runner(populateContext, updateContext)
    } catch (error) {
      logger.error(`Error running script ${script.constructor.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
