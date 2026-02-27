import { prisma } from "../../../../../lib/prisma"
import { logger } from "../../../../utils/logger"
import { blockfrostFetch } from "../../../utils"
import { getLatestFeesEarnings } from "../../../../client/feesEarnings"

export async function rollbackFeesEarnings() {
  const latestFeesEarned = await getLatestFeesEarnings()
  if (!latestFeesEarned) return

  const chainLatest = (await blockfrostFetch("/epochs/latest")) as {
    epoch: number
  }

  // Last fully completed epoch
  const lastCompleteEpoch = chainLatest.epoch - 1

  const syncIsValid = latestFeesEarned.epoch <= lastCompleteEpoch

  if (syncIsValid) {
    logger.info("No rollback detected")
    return
  }

  logger.warn(`Checking rollback from: ${latestFeesEarned.epoch}`)

  const deleted = await prisma.aDAStakingRewards.deleteMany({
    where: { epoch: { gt: lastCompleteEpoch } },
  })

  logger.warn(`Rollback completed. Deleted ${deleted.count} fees earnings rows`)
}
