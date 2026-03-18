import { Data } from "@lucid-evolution/lucid"
import { OrderDatum } from "@open-djed/data"
import { prisma } from "../../../../lib/prisma"
import { getLatestFeesEarnings } from "../../../client/feesEarnings"
import { logger } from "../../../utils/logger"
import type { OrderUTxOWithDatumAndBlock, UTxO } from "../../types"
import {
  blockfrost,
  blockfrostFetch,
  enrichOrdersWithPoolDatums,
  hasPoolDatum,
  processBatch,
  registry,
} from "../../utils"
import { calculateFeesEarnings } from "./feesEarnings"

const orderKey = (
  order: Pick<OrderUTxOWithDatumAndBlock, "tx_hash" | "output_index">,
) => `${order.tx_hash}:${order.output_index}`

async function getAnchorOrders(
  latestFees: NonNullable<Awaited<ReturnType<typeof getLatestFeesEarnings>>>,
) {
  const anchorOrderRow = await prisma.order.findFirst({
    where: {
      block: latestFees.block,
      slot: latestFees.slot,
      status: "Completed",
    },
    orderBy: { id: "desc" },
  })

  if (!anchorOrderRow) {
    logger.warn("Could not resolve anchor order for latest fees earnings row")
    return []
  }

  const anchorTx = (await blockfrostFetch(
    `/txs/${anchorOrderRow.tx_hash}/utxos`,
  )) as UTxO
  const anchorOutput = anchorTx.outputs.find(
    (output) =>
      output.output_index === anchorOrderRow.out_index &&
      typeof output.consumed_by_tx === "string" &&
      output.amount.some((asset) => asset.unit === registry.orderAssetId),
  )

  if (!anchorOutput?.consumed_by_tx) {
    logger.warn("Latest fees anchor order is missing its consuming transaction")
    return []
  }

  const consumingOrderTx = (await blockfrostFetch(
    `/txs/${anchorOutput.consumed_by_tx}/utxos`,
  )) as UTxO

  const anchorInputs = consumingOrderTx.inputs.filter(
    (input) =>
      typeof input.data_hash === "string" &&
      input.amount.some((asset) => asset.unit === registry.orderAssetId),
  )

  if (anchorInputs.length === 0) {
    logger.warn("Could not resolve anchor consuming transaction inputs")
    return []
  }

  return processBatch(
    anchorInputs,
    async (input) => {
      const dbOrder = await prisma.order.findFirst({
        where: {
          tx_hash: input.tx_hash,
          out_index: input.output_index,
        },
      })

      if (!dbOrder || !input.data_hash) {
        return null
      }

      const rawDatum = await blockfrost.getDatum(input.data_hash)
      const orderDatum = Data.from(rawDatum, OrderDatum)

      return {
        ...input,
        orderDatum,
        timestamp: new Date(Number(orderDatum.creationDate)).toISOString(),
        consumed_by_tx: anchorOutput.consumed_by_tx,
        block_hash: dbOrder.block,
        block_slot: Number(dbOrder.slot),
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter(
      (order): order is OrderUTxOWithDatumAndBlock => order !== null,
    ),
  )
}

async function upsertDailyFees(
  dailyFees: Awaited<ReturnType<typeof calculateFeesEarnings>>,
) {
  await prisma.$transaction(
    dailyFees.map((entry) =>
      prisma.aDAFeesEarnings.upsert({
        where: { timestamp: entry.timestamp },
        create: entry,
        update: {
          fee: { increment: entry.fee },
          rate: { increment: entry.rate },
          block: entry.block,
          slot: entry.slot,
        },
      }),
    ),
  )
}

export async function updateFeesEarnings(
  completedOrders: OrderUTxOWithDatumAndBlock[],
) {
  logger.info("=== Updating Fees Earnings ===")

  const latestFees = await getLatestFeesEarnings()
  if (!latestFees) {
    logger.info("No latest fees earnings entry found, skipping update")
    return
  }

  if (completedOrders.length === 0) {
    logger.info("No completed orders to update fees earnings")
    return
  }

  const anchorOrders = await getAnchorOrders(latestFees)
  if (anchorOrders.length === 0) {
    logger.info("Could not resolve fees earnings anchor, skipping update")
    return
  }

  const uniqueOrders = [
    ...new Map(
      [...anchorOrders, ...completedOrders].map((order) => [
        orderKey(order),
        order,
      ]),
    ).values(),
  ]

  const enrichedOrders = await enrichOrdersWithPoolDatums(uniqueOrders)
  const ordersWithPoolDatum = enrichedOrders.filter(hasPoolDatum)

  if (ordersWithPoolDatum.length < 2) {
    logger.info("No new fees earnings entries to update")
    return
  }

  const dailyFees = calculateFeesEarnings(ordersWithPoolDatum)
  if (dailyFees.length === 0) {
    logger.info("No fees earnings entries calculated")
    return
  }

  await upsertDailyFees(dailyFees)

  logger.info(`Updated ${dailyFees.length} fees earnings entries`)
}
