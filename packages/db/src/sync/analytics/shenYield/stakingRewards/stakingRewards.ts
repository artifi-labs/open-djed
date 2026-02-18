import { prisma } from "../../../../../lib/prisma"
import { logger } from "../../../../utils/logger"
import {
  type ADAStakingRewards,
  type History,
  type Rewards,
} from "../../../types"
import {
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
} from "../../../utils"
import { handleAnalyticsUpdates } from "../../updateAnalytics"
import { getLatestStakingReward } from "../../../../client/stakingRewards"

const STAKE_ADDRESS =
  "stake1uyd6tfxa3sae586zjvll7qjx8ywj9x8l3dddgc8dkc0tshssd5g6e"

export async function processStakingRewards() {
  const start = Date.now()
  logger.info("=== Processing ADA staking rewards ===")

  const accountRewards = await getEveryResultFromPaginatedEndpoint<Rewards>(
    `/accounts/${STAKE_ADDRESS}/rewards`,
  )
  const accountHistory = await getEveryResultFromPaginatedEndpoint<History>(
    `/accounts/${STAKE_ADDRESS}/history`,
  )

  const stakeByEpoch = new Map<number, bigint>()
  for (const h of accountHistory) {
    stakeByEpoch.set(h.active_epoch, BigInt(h.amount))
  }

  const dataToInsert: ADAStakingRewards[] = []

  for (const rewards of accountRewards) {
    const activeStake = stakeByEpoch.get(rewards.epoch)
    if (!activeStake || activeStake === 0n) continue

    const rate = (Number(BigInt(rewards.amount)) / Number(activeStake)) * 100

    const epochInfo = (await blockfrostFetch(`/epochs/${rewards.epoch}`)) as {
      start_time: number
      end_time: number
    }
    dataToInsert.push({
      epoch: rewards.epoch,
      startTimestamp: new Date(epochInfo.start_time * 1000),
      endTimestamp: new Date(epochInfo.end_time * 1000),
      rate,
    })
  }

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
  if (!latestStakingReward) return
  await handleAnalyticsUpdates(
    latestStakingReward.endTimestamp,
    processStakingRewards,
  )
  const end = Date.now() - start
  logger.info(
    `=== Updating ADA staking rewards took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
