import { prisma } from "../../../../lib/prisma"
import { getLatestStakingReward } from "../../../client/stakingRewards"
import { logger } from "../../../utils/logger"
import type { Block } from "../../types"
import { blockfrostFetch } from "../../utils"

export async function rollbackStakingRewards() {
  const latestStakingRewards = await getLatestStakingReward()
  if (!latestStakingRewards) return

  const syncIsValid = await blockfrostFetch(
    `/blocks/${latestStakingRewards.block}`,
  )
    .then(() => true)
    .catch((error) => {
      if (error.response?.status === 404) return false
      throw error
    })

  if (syncIsValid) {
    logger.info("NO rollback detected")
    return
  }

  logger.warn(`Checking rollback from ${latestStakingRewards.block}`)

  const storedBlocks = await prisma.aDAStakingRewards.findMany({
    where: { slot: { lte: latestStakingRewards.slot } },
    select: { block: true, slot: true },
    orderBy: { slot: "desc" },
    distinct: ["block"],
  })

  for (const blockEntry of storedBlocks) {
    const exists = await (
      (await blockfrostFetch(`/blocks/${blockEntry.block}`)) as Promise<Block>
    )
      .then(() => true)
      .catch(() => false)

    if (exists) {
      logger.warn(
        `rollback anchor found at block ${blockEntry.block} slot ${blockEntry.slot}`,
      )

      await prisma.aDAStakingRewards.deleteMany({
        where: { slot: { gt: blockEntry.slot } },
      })

      logger.info("Rollback completed")
      return
    }
  }

  throw new Error("Rollback exceeds DB history — full resync required")
}
