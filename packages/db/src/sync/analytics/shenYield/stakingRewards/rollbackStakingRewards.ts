import { prisma } from "../../../../../lib/prisma"
import { logger } from "../../../../utils/logger"
import { blockfrostFetch } from "../../../utils"
import { getLatestStakingReward } from "../../../../client/stakingRewards"

export async function rollbackStakingRewards() {
  const latestStakingRewards = await getLatestStakingReward()
  if (!latestStakingRewards) return

  const chainLatest = (await blockfrostFetch("/epochs/latest")) as {
    epoch: number
  }

  // Last fully completed epoch
  const lastCompleteEpoch = chainLatest.epoch - 1

  const syncIsValid = latestStakingRewards.epoch <= lastCompleteEpoch

  if (syncIsValid) {
    logger.info("No rollback detected")
    return
  }

  logger.warn(`Checking rollback from: ${latestStakingRewards.epoch}`)

  const deleted = await prisma.aDAStakingRewards.deleteMany({
    where: { epoch: { gt: lastCompleteEpoch } },
  })

  logger.warn(
    `Rollback completed. Deleted ${deleted.count} staking reward rows`,
  )
}
