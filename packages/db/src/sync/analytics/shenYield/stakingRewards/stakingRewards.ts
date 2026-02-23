import { prisma } from "../../../../../lib/prisma"
import { getLatestStakingReward } from "../../../../client/stakingRewards"
import { logger } from "../../../../utils/logger"
import {
  type ADAStakingRewards,
  type History,
  type Rewards,
} from "../../../types"
import {
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
  processBatch,
  registry,
} from "../../../utils"

export async function calculateStakingRewards() {
  const start = Date.now()
  logger.info("=== Processing ADA staking rewards ===")

  const latestStakingReward = await getLatestStakingReward()
  const latestSyncedEpoch = latestStakingReward?.epoch ?? -1

  const accountRewards = await getEveryResultFromPaginatedEndpoint<Rewards>(
    `/accounts/${registry.stakeAddress}/rewards`,
  )

  const newRewards = accountRewards.filter((r) => r.epoch > latestSyncedEpoch)

  if (newRewards.length === 0) {
    logger.info("No new ADA staking rewards to process")
    return
  }

  const accountHistory = await getEveryResultFromPaginatedEndpoint<History>(
    `/accounts/${registry.stakeAddress}/history`,
  )

  const stakeByEpoch = new Map(
    accountHistory.map(({ active_epoch, amount }) => [
      active_epoch,
      BigInt(amount),
    ]),
  )

  const dataToInsert: ADAStakingRewards[] = []

  // Process in batches to avoid rate limits and speed up execution
  await processBatch(
    newRewards,
    async (rewards) => {
      // Cardano rewards distributed at epoch N are earned from stake active in epoch N-2
      const activeStake = stakeByEpoch.get(rewards.epoch - 2)
      if (!activeStake || activeStake === 0n) return

      const rate = (Number(rewards.amount) / Number(activeStake)) * 100

      try {
        const epochInfo = (await blockfrostFetch(
          `/epochs/${rewards.epoch}`,
        )) as {
          start_time: number
          end_time: number
        }
        dataToInsert.push({
          epoch: rewards.epoch,
          startTimestamp: new Date(epochInfo.start_time * 1000),
          endTimestamp: new Date(epochInfo.end_time * 1000),
          rate,
        })
      } catch (error) {
        logger.error(error, `Failed to fetch info for epoch ${rewards.epoch}`)
      }
    },
    10,
    100,
  )

  if (dataToInsert.length === 0) {
    logger.info("No ADA staking rewards rows ready to insert")
    return
  }

  logger.info(`Inserting ${dataToInsert.length} staking reward rows...`)
  await prisma.aDAStakingRewards.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })

  const end = Date.now() - start
  logger.info(
    `=== Processing ADA staking rewards took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateStakingRewards() {
  const start = Date.now()
  logger.info("=== Updating ADA staking rewards ===")

  const latestStakingReward = await getLatestStakingReward()
  const chainLatest = (await blockfrostFetch("/epochs/latest")) as {
    epoch: number
  }

  // If we have no rewards or if we are behind the latest epoch, recalculate
  // Note: we can sync up to chainLatest.epoch - 1 (last fully completed epoch)
  if (
    !latestStakingReward ||
    latestStakingReward.epoch < chainLatest.epoch - 1
  ) {
    await calculateStakingRewards()
  } else {
    logger.info("ADA staking rewards are already up to date")
  }

  const end = Date.now() - start
  logger.info(
    `=== Updating ADA staking rewards took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
