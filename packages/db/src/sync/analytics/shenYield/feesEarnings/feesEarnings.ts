import { logger } from "../../../../utils/logger"
import { toDayString } from "../../../utils"
import {
  type ADAFeesEarnings,
  type OrderedPoolOracleTxOs,
  type PoolUTxoWithDatumAndTimestamp,
} from "../../../types"
import { prisma } from "../../../../../lib/prisma"
import { getLatestFeesEarnings } from "../../../../client/feesEarnings"
import { handleAnalyticsUpdates } from "../../updateAnalytics"

export async function calculateFeesEarnings(
  orderedTxOs: OrderedPoolOracleTxOs[],
) {
  if (!orderedTxOs || orderedTxOs.length === 0) {
    logger.warn("No ordered TxOs provided for fees earnings calculation")
    return
  }

  const start = Date.now()
  logger.info("=== Processing ADA fees earned ===")

  const poolEntries = orderedTxOs.filter(
    (entry): entry is { key: "pool"; value: PoolUTxoWithDatumAndTimestamp } =>
      entry.key === "pool",
  )

  if (poolEntries.length < 2) {
    logger.info("Not enough pool checkpoints to compute fees")
    return
  }

  const dailyFees: ADAFeesEarnings[] = []

  for (let i = 1; i < poolEntries.length; i++) {
    const previousEntry = poolEntries[i - 1]
    const currentEntry = poolEntries[i]

    const previous = previousEntry.value.poolDatum
    const current = currentEntry.value.poolDatum

    if (previous.djedInCirculation === 0n) continue

    const expectedAdaInReserve =
      (previous.adaInReserve * current.djedInCirculation) /
      previous.djedInCirculation

    const feesLovelace = current.adaInReserve - expectedAdaInReserve
    if (feesLovelace <= 0n) continue

    const feeAda = Number(feesLovelace) / 1_000_000

    const block = currentEntry.value.block_hash
    const slot = currentEntry.value.block_slot
    const timestamp = new Date(currentEntry.value.timestamp)
    const dayKey = toDayString(timestamp)
    const normalizedTimestamp = new Date(`${dayKey}T00:00:00.000Z`)

    const existing = dailyFees.find(
      (entry) => toDayString(entry.timestamp) === dayKey,
    )

    if (existing) {
      existing.fee += feeAda
      existing.block = block
      existing.slot = slot
    } else {
      dailyFees.push({
        timestamp: normalizedTimestamp,
        fee: feeAda,
        block,
        slot,
      })
    }
  }

  if (dailyFees.length === 0) {
    logger.warn("No daily fees earnings computed")
    return
  }

  logger.info("Processing fees earnings data...")
  logger.info(`Inserting ${dailyFees.length} fees earnings into database...`)
  await prisma.aDAFeesEarnings.createMany({
    data: dailyFees,
    skipDuplicates: true,
  })
  logger.info(
    `Historic fees earnings sync complete. Inserted ${dailyFees.length} fees earnings`,
  )

  const end = Date.now() - start
  logger.info(
    `=== Processing fees earnings took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}

export async function updateFeesEarnings() {
  const start = Date.now()
  logger.info(`=== Updating Fees Earnings ===`)
  const latestFeesEarnings = await getLatestFeesEarnings()
  if (!latestFeesEarnings) return

  await handleAnalyticsUpdates(
    latestFeesEarnings.timestamp,
    calculateFeesEarnings,
  )
  const end = Date.now() - start
  logger.info(
    `=== Updating Fees Earnings took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
