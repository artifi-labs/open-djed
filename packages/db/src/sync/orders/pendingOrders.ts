import { logger } from "../../utils/logger"
import { config } from "../../../lib/env"
import { prisma } from "../../../lib/prisma"
import type { UTxO, AddressDatum } from "../types"
import {
  registry,
  processBatch,
  blockfrostFetch,
  constructAddress,
  network,
} from "../utils"

/**
 * search the database for orders that have status 'Created', meaning that the order is yet to be fulfilled
 * having every unfulfilled order, query blockfrost to check if the corresponding UTxO has been spent
 * if the UTxO was consumed then the order was fulfilled and the order can be update to status 'Completed'
 * @returns
 */
export async function updatePendingOrders() {
  logger.info("=== Updating Pending Orders ===")

  const pendingOrders = await prisma.order.findMany({
    where: { status: "Created" },
  })

  if (pendingOrders.length === 0) {
    logger.info("No orders to update")
    return
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

        if (order.action === "Burn" && isConsumed) {
          const address = order.address as AddressDatum
          const paymentKeyHash = address.paymentKeyHash[0]
          const stakeKeyHash = address.stakeKeyHash[0]?.[0]?.[0]
          if (!paymentKeyHash || !stakeKeyHash) {
            throw new Error(
              `Invalid address structure for order ${order.tx_hash}`,
            )
          }
          const userAddr = constructAddress(
            paymentKeyHash,
            stakeKeyHash,
            network,
          )

          const utxosOfConsumingTx = (await blockfrostFetch(
            `/txs/${orderUTxOWithUnit.consumed_by_tx}/utxos`,
          )) as UTxO
          const outputUTxOToUserAddr = utxosOfConsumingTx.outputs.find(
            (utxo) => utxo.address === userAddr,
          )
          if (!outputUTxOToUserAddr) {
            throw new Error(
              "Could not find output UTxO to user address in consuming transaction",
            )
          }
          received = BigInt(
            outputUTxOToUserAddr.amount.find((a) => a.unit === "lovelace")
              ?.quantity ?? "0",
          )
        }

        return { tx_hash: order.tx_hash, isConsumed, received: received }
      } catch (error) {
        logger.error(error, `Error checking order ${order.tx_hash}:`)
        return {
          tx_hash: order.tx_hash,
          isConsumed: false,
          received: order.received,
        }
      }
    },
    config.BATCH_SIZE_MEDIUM,
    config.BATCH_DELAY_LARGE,
  )

  const completedOrders = orderStatusUpdates.filter((o) => o.isConsumed)

  if (completedOrders.length > 0) {
    logger.info(`Marking ${completedOrders.length} orders as completed`)

    await Promise.all(
      completedOrders.map((order) =>
        prisma.order.update({
          where: { tx_hash: order.tx_hash },
          data: { status: "Completed", received: order.received },
        }),
      ),
    )

    logger.info(`Updated ${completedOrders.length} orders to Completed status`)
  } else {
    logger.info("No pending orders were completed")
  }
}
