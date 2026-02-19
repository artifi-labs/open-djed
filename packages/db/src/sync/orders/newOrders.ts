import { logger } from "../../utils/logger"
import { config } from "../../../lib/env"
import { Data } from "@lucid-evolution/lucid"
import { OrderDatum } from "@open-djed/data"
import { prisma } from "../../../lib/prisma"
import type {
  Transaction,
  UTxO,
  TransactionData,
  OrderUTxO,
  OrderUTxOWithDatum,
  Order,
} from "../types"
import {
  registry,
  blockfrost,
  processBatch,
  blockfrostFetch,
  processOrdersToInsert,
  fetchTransactionsFromAddress,
} from "../utils"
import { populateDbWithHistoricOrders } from "./initialSync"

/**
 * get the UTxOs of a set of transactions
 * filter the UTxOs to check if any references the DjedOrderTicket
 * any UTxO that references the DjedOrderTicket, represents a new order UTxO
 * @param txHashes array with transaction hashes
 * @returns array with the Order UTxOs
 */
async function fetchOrderUTxOs(txHashes: Transaction[]) {
  const allUTxOs = await processBatch(
    txHashes,
    async (tx) => {
      const utxo = (await blockfrostFetch(`/txs/${tx.tx_hash}/utxos`)) as UTxO
      return utxo
    },
    config.BATCH_SIZE_MEDIUM,
    config.BATCH_DELAY_LARGE,
  )
  const orderUTxOs: OrderUTxO[] = allUTxOs.flatMap((utxo) =>
    utxo.outputs
      .filter((output) =>
        output.amount.some((amt) => amt.unit === registry.orderAssetId),
      )
      .map((output) => ({ ...output, tx_hash: utxo.hash })),
  )
  logger.info(`Found ${orderUTxOs.length} order UTxOs`)
  return orderUTxOs
}

/**
 * decodes the datum of each order UTxO and retrieves the hash of the block where the transaction was included
 * @param orderUTxOs array with Order UTxOs
 * @returns array of Order UTxOs, with decoded datum
 */
async function enrichUTxOsWithData(orderUTxOs: OrderUTxO[]) {
  return await processBatch(
    orderUTxOs,
    async (utxo, idx) => {
      try {
        const [rawDatum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash)
            : Promise.resolve(undefined),
          blockfrostFetch(`/txs/${utxo.tx_hash}`) as Promise<TransactionData>,
        ])

        if (!rawDatum) {
          throw new Error(`Couldn't get order datum for ${utxo.tx_hash}`)
        }

        return {
          ...utxo,
          orderDatum: Data.from(rawDatum, OrderDatum),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        logger.error(
          error,
          `Error processing UTxO ${idx + 1}/${orderUTxOs.length}:`,
        )
        throw error
      }
    },
    config.BATCH_SIZE_SMALL,
    config.BATCH_DELAY_SMALL,
  )
}

/**
 * update the latest block in the database
 * @param latestSyncedBlock latest synced block
 * @param newOrders array of new orders
 * @returns latest synced block
 */
async function updateLatestBlock(
  latestSyncedBlock: { id: number },
  newOrders: Order[],
) {
  if (newOrders.length === 0) return latestSyncedBlock

  const latestOrder = newOrders.reduce((latest, current) => {
    return latest.slot > current.slot ? latest : current
  })

  if (latestOrder) {
    await prisma.block.update({
      where: { id: latestSyncedBlock.id },
      data: { latestBlock: latestOrder.block, latestSlot: latestOrder.slot },
    })
    logger.info(`New latest block: ${latestOrder.block}`)
  }

  return latestSyncedBlock
}

/**
 * sync the database with the newly created orders
 * check every new block, within the safety margin, after the last sync, and get every new transaction
 * check the UTxOs of the new transactions to check if any new order was created
 * @returns
 */
export async function syncNewOrders() {
  logger.info("=== Syncing New Orders ===")

  let latestSyncedBlock = await prisma.block.findFirst()
  if (!latestSyncedBlock) {
    logger.warn(
      "No synced block found in database, skipping. performing initial sync...",
    )
    await populateDbWithHistoricOrders()
    latestSyncedBlock = await prisma.block.findFirst()
    if (!latestSyncedBlock) {
      logger.error("Initial sync failed to create a block record.")
      return { id: 0, latestBlock: "", latestSlot: 0 }
    }
  }

  const syncedBlock = (await blockfrostFetch(
    `/blocks/${latestSyncedBlock.latestBlock}`,
  )) as {
    height: number
  }

  const transactions = await fetchTransactionsFromAddress(syncedBlock.height)
  if (transactions.length === 0) {
    logger.info("No new transactions since last sync")
    return latestSyncedBlock
  }

  const orderUTxOs = await fetchOrderUTxOs(transactions)
  if (orderUTxOs.length === 0) {
    logger.info("No order UTxOs in new blocks")
    return latestSyncedBlock
  }

  const orderUTxOsWithData: OrderUTxOWithDatum[] =
    await enrichUTxOsWithData(orderUTxOs)
  const ordersToInsert: Order[] =
    await processOrdersToInsert(orderUTxOsWithData)
  if (ordersToInsert.length === 0) {
    logger.info("No orders to insert")
    return latestSyncedBlock
  }

  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })

  logger.info(`Successfully inserted ${ordersToInsert.length} new orders`)

  return updateLatestBlock(latestSyncedBlock, ordersToInsert)
}
