import { logger } from "../utils/logger"
import { buildPopulateContext, buildUpdateContext } from "./analytics/context/context"
import { historyScriptRegistry } from "./registry"

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
  const scriptsStatus = await Promise.all(
    historyScriptRegistry.map(async (script) => ({
      script,
      ...await script.needAction()
    }))
  )

  const hasPopulate = scriptsStatus.some((s) => s.needPopulate)
  const hasUpdate = scriptsStatus.some((s) => s.needUpdate)

  if (hasPopulate) {
    const scriptsToPopulate = scriptsStatus
      .filter(s => s.needPopulate)
      .map(s => s.script.constructor.name)
      .join(", ")
    logger.info(`Scripts that need populate: ${scriptsToPopulate}`)
  }

  if (hasUpdate) {
    const scriptsToUpdate = scriptsStatus
      .filter(s => s.needUpdate)
      .map(s => s.script.constructor.name)
      .join(", ")
    logger.info(`Scripts that need update: ${scriptsToUpdate}`)
  }

  if (!hasUpdate && !hasPopulate) {
    logger.info("No scripts need update or populate. All scripts are up to date.")
    return
  }

  if (hasUpdate) {
    const scriptsNeedingUpdate = scriptsStatus.filter((s) => s.needUpdate)
    const latestTimestamps = await Promise.all(
      scriptsNeedingUpdate.map(async ({ script }) => await script.latestTimestamp?.())
    )

    if (latestTimestamps.length > 0) {
      const validTimestamps = latestTimestamps.filter((timestamp) => timestamp !== undefined)
      if (validTimestamps.length === 0) {
        throw new Error("No valid timestamps found for scripts that need update. Cannot build update context.")
      }
      const oldestTimestamp = new Date(
        Math.min(...validTimestamps.map((timestamp) => timestamp.getTime()))
      )
      logger.info(`Oldest timestamp among scripts that need update: ${oldestTimestamp.toISOString()}`)

      logger.info("=== Building update context ===")
      updateContext = await buildUpdateContext(oldestTimestamp)
    } else {
      throw new Error("No valid timestamps found for scripts that need update. Cannot build update context.")
    }

  }

  if (hasPopulate) {
    logger.info("=== Building populate context ===")
    populateContext = await buildPopulateContext()
  }

  for (const { script, needPopulate, needUpdate } of scriptsStatus) {
    logger.info(`=== Running script ${script.constructor.name} ===`)

    try {
      await script.runner(populateContext, updateContext, { needPopulate, needUpdate })
    } catch (error) {
      logger.error(`Error running script ${script.constructor.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
