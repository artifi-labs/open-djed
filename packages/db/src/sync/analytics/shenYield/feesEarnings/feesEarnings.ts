import { logger } from "../../../../utils/logger"
import {
  getEveryResultFromPaginatedEndpoint,
  processAnalyticsDataToInsert,
  processPoolOracleTxs,
  registry,
  toDayString,
} from "../../../utils"
import {
  type ADAFeesEarnings,
  type PoolEntryFee,
  type Transaction,
} from "../../../types"
import { prisma } from "../../../../../lib/prisma"

function normalizePoolEntriesToADAFees(
  entries: PoolEntryFee[],
): ADAFeesEarnings[] {
  const dailyFees = new Map<string, ADAFeesEarnings>()

  for (const entry of entries) {
    const dayKey = toDayString(entry.timestamp)
    const normalizedTimestamp = new Date(`${dayKey}T00:00:00.000Z`)
    const feeValue =
      typeof entry.fee === "bigint" ? Number(entry.fee) : entry.fee

    const existing = dailyFees.get(dayKey)
    if (existing) {
      existing.fee += feeValue
      continue
    }

    dailyFees.set(dayKey, {
      timestamp: normalizedTimestamp,
      fee: feeValue,
    })
  }

  return Array.from(dailyFees.values())
}

export async function calculateFeesEarnings() {
  const start = Date.now()
  logger.info("=== Processing ADA fees earned ===")

  const everyPoolTx = await getEveryResultFromPaginatedEndpoint<Transaction>(
    `/addresses/${registry.poolAddress}/transactions`,
  )

  const orderedPoolTxOs = await processPoolOracleTxs(everyPoolTx, [])
  if (!orderedPoolTxOs) {
    logger.warn(
      "No pool or oracle transactions processed — skipping fee computation",
    )
    return []
  }

  if (orderedPoolTxOs.length < 2) {
    logger.info("Not enough pool checkpoints to compute fees")
    return []
  }

  const entries: PoolEntryFee[] = []

  for (let i = 1; i < orderedPoolTxOs.length; i++) {
    const previous = orderedPoolTxOs[i - 1].value.poolDatum
    const current = orderedPoolTxOs[i].value.poolDatum

    if (previous.djedInCirculation === 0n) continue

    const expectedAdaInReserve =
      (previous.adaInReserve * current.djedInCirculation) /
      previous.djedInCirculation

    const feesLovelace = current.adaInReserve - expectedAdaInReserve

    if (feesLovelace <= 0n) continue

    entries.push({
      timestamp: new Date(orderedPoolTxOs[i].value.timestamp),
      adaInReserve: current.adaInReserve,
      expectedAdaInReserve: expectedAdaInReserve,
      djedInCirculation: current.djedInCirculation,
      fee: feesLovelace,
      blockHash: orderedPoolTxOs[i].value.block_hash,
      blockSlot: orderedPoolTxOs[i].value.block_slot,
    })
  }

  if (entries.length === 0) {
    logger.warn("No daily fees earnings computed")
  }

  const aggregatedFees = normalizePoolEntriesToADAFees(entries)

  logger.info("Processing fees earnings data...")

  const dataToInsert = processAnalyticsDataToInsert(aggregatedFees)

  logger.info(`Inserting ${dataToInsert.length} fees earnings into database...`)
  await prisma.aDAFeesEarnings.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic fees earnings sync complete. Inserted ${dataToInsert.length} fees earnings`,
  )

  const end = Date.now() - start
  logger.info(
    `=== Processing fees earnings took sec: ${(end / 1000).toFixed(2)} ===`,
  )
}
