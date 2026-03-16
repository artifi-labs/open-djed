import { logger } from "../../utils/logger"
import { config } from "../../../lib/env"
import { Data } from "@lucid-evolution/lucid"
import { OrderDatum } from "@open-djed/data"
import { prisma } from "../../../lib/prisma"
import type { UTxO, AddressDatum, OrderUTxOWithDatumAndBlock } from "../types"
import {
  registry,
  processBatch,
  blockfrost,
  blockfrostFetch,
  handleOrderStatus,
  getBurnReceivedValue,
} from "../utils"

/**
 * search the database for orders that have status 'Created', meaning that the order is yet to be fulfilled
 * having every unfulfilled order, query blockfrost to check if the corresponding UTxO has been spent
 * if the UTxO was consumed then the order was fulfilled and the order can be update to status 'Completed'
 * @returns
 */
export async function updatePendingOrders(): Promise<
  OrderUTxOWithDatumAndBlock[]
> {
  logger.info("=== Updating Pending Orders ===")

  const pendingOrders = await prisma.order.findMany({
    where: { status: "Created" },
  })

  if (pendingOrders.length === 0) {
    logger.info("No orders to update")
    return []
  }
  logger.info(`Found ${pendingOrders.length} pending orders to check.`)

  const orderStatusUpdates = await processBatch(
    pendingOrders,
    async (order) => {
      try {
        const utxo = (await blockfrostFetch(
          `/txs/${order.tx_hash}/utxos`,
        )) as UTxO
        const orderUTxOWithUnit = utxo.outputs.find(
          (output) =>
            output.address === registry.orderAddress &&
            output.amount.some((amt) => amt.unit === registry.orderAssetId),
        )

        const isConsumed = typeof orderUTxOWithUnit?.consumed_by_tx === "string"
        let received = order.received
        let status = order.status
        let completedOrder: OrderUTxOWithDatumAndBlock | null = null

        if (isConsumed) {
          status = await handleOrderStatus(
            orderUTxOWithUnit.consumed_by_tx,
            order.tx_hash,
            order.out_index,
          )
          if (order.action === "Burn") {
            const addr = order.address as AddressDatum
            received = await getBurnReceivedValue(
              addr,
              orderUTxOWithUnit.consumed_by_tx,
            )
          }

          if (orderUTxOWithUnit.data_hash) {
            const rawDatum = await blockfrost.getDatum(
              orderUTxOWithUnit.data_hash,
            )
            const orderDatum = Data.from(rawDatum, OrderDatum)

            completedOrder = {
              ...orderUTxOWithUnit,
              tx_hash: order.tx_hash,
              orderDatum,
              timestamp: new Date(
                Number(orderDatum.creationDate),
              ).toISOString(),
              block_hash: order.block,
              block_slot: Number(order.slot),
            }
          }
        }

        return {
          tx_hash: order.tx_hash,
          isConsumed,
          status: status,
          received: received,
          completedOrder,
        }
      } catch (error) {
        logger.error(error, `Error checking order ${order.tx_hash}:`)
        return {
          tx_hash: order.tx_hash,
          isConsumed: false,
          status: order.status,
          received: order.received,
          completedOrder: null,
        }
      }
    },
    config.BATCH_SIZE_MEDIUM,
    config.BATCH_DELAY_LARGE,
  )

  const completedOrders = orderStatusUpdates.filter((o) => o.isConsumed)

  if (completedOrders.length > 0) {
    await Promise.all(
      completedOrders.map((order) =>
        prisma.order.update({
          where: { tx_hash: order.tx_hash },
          data: { status: order.status, received: order.received },
        }),
      ),
    )

    logger.info(`Updated ${completedOrders.length} orders.`)
  } else {
    logger.info("No pending orders were completed")
  }

  return completedOrders.flatMap((order) =>
    order.completedOrder ? [order.completedOrder] : [],
  )
}
