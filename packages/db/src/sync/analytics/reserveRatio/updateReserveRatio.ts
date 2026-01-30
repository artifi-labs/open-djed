import { logger } from "../../../utils/logger"
import { config } from "../../../../lib/env"
import { Data } from "@lucid-evolution/lucid"
import { OrderDatum } from "@open-djed/data"
import { prisma } from "../../../../lib/prisma"
import type {
  Transaction,
  UTxO,
  TransactionData,
  OrderUTxO,
  OrderUTxOWithDatum,
  Order,
} from "../../types"
import {
  registry,
  blockfrost,
  processBatch,
  sleep,
  blockfrostFetch,
  processOrdersToInsert,
} from "../../utils"
import { populateDbWithHistoricReserveRatio } from "./initialSync"
import { getLatestReserveRatio } from "../../../client/reserveRatio"

/**
 * Fetches transactions from the order address using the `/addresses/{address}/transactions` endpoint.
 * It will also handle pagination.
 * @param fromBlock The block number to start fetching transactions from.
 * @returns An array of transaction hashes.
 */
async function fetchTransactionsFromAddress(
  fromBlock: number,
): Promise<string[]> {
  const transactions: string[] = []
  let page = 1
  while (true) {
    const pageResult = (await blockfrostFetch(
      `/addresses/${registry.orderAddress}/transactions?page=${page}&count=100&from=${fromBlock}`,
    )) as Transaction[]

    if (!Array.isArray(pageResult) || pageResult.length === 0) break

    transactions.push(...pageResult.map((tx) => tx.tx_hash))
    page++

    await sleep(50)
  }
  logger.info(
    `Found ${transactions.length} new transactions at the order address`,
  )
  return transactions
}

/**
 * get the UTxOs of a set of transactions
 * filter the UTxOs to check if any references the DjedOrderTicket
 * any UTxO that references the DjedOrderTicket, represents a new order UTxO
 * @param txHashes array with transaction hashes
 * @returns array with the Order UTxOs
 */
async function fetchOrderUTxOs(txHashes: string[]) {
  const allUTxOs = await processBatch(
    txHashes,
    async (tx) => {
      const utxo = (await blockfrostFetch(`/txs/${tx}/utxos`)) as UTxO
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
 * sync the database with the most recent reserve ratio averages
 * check every new block, within the safety margin, after the last sync, and get every new transaction
 * check the UTxOs of the new transactions and calculate the resereve ratios
 * @returns
 */
export async function syncReserveRatios() {
  logger.info("=== Syncing Reserve Ratios ===")

  const isDbPopulated = (await prisma.reserveRatio.count()) > 0
  if (!isDbPopulated) {
    // populate historic data if the database is empty
    await populateDbWithHistoricReserveRatio()
  }

  const latestReserveRatio = await getLatestReserveRatio()
  // return if latest was less than 24h ago
  if (
    latestReserveRatio &&
    latestReserveRatio.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
  ) {
    logger.info(
      "=== Latest reserve ratio is less than 24h old, skipping update ===",
    )
    return
  }

  const latestSyncedBlock = latestReserveRatio?.block
  // await updateReserveRatio(latestSyncedBlock)
  return
}
