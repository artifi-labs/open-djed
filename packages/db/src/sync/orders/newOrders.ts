import { logger } from '../../utils/logger'
import { config } from '../../../lib/env'
import { Data } from '@lucid-evolution/lucid'
import { OrderDatum } from '@open-djed/data'
import { prisma } from '../../../lib/prisma'
import type { Block, UTxO, TransactionData, OrderUTxO, OrderUTxOWithDatum, Order } from '../types'
import { registry, blockfrost, processBatch, parseOrderDatum, sleep, blockfrostFetch } from '../utils'
import { populateDbWithHistoricOrders } from './initialSync'

/**
 * fetches new blocks from Blockfrost starting after the latest synced block
 * @param latestBlockHash hash of the latest synced block
 * @returns every block created after the latest synced block
 */
async function fetchNewBlocks(latestBlockHash: string): Promise<Block[]> {
  const blocks: Block[] = []
  let page = 1
  while (true) {
    const pageResult = (await blockfrostFetch(
      `/blocks/${latestBlockHash}/next?page=${page}&count=100`,
    )) as Block[]

    if (!Array.isArray(pageResult) || pageResult.length === 0) break

    blocks.push(...pageResult)
    page++

    await sleep(50)
  }
  logger.info(`Found ${blocks.length} new blocks`)
  return blocks
}

/**
 * get every transaction present in a given set of blocks
 * @param blockHashes array of block hashes
 * @returns array with the transaction hashes of every transaction present in the blocks
 */
async function fetchTransactionsFromBlocks(blockHashes: string[]): Promise<string[]> {
  const blockTxs = await processBatch(
    blockHashes,
    async (hash) => {
      const txs = (await blockfrostFetch(`/blocks/${hash}/txs`)) as string[]
      return txs
    },
    config.BATCH_SIZE_MEDIUM,
    config.BATCH_DELAY_MEDIUM,
  )
  const allTxs = blockTxs.flat()
  logger.info(`Found ${allTxs.length} transactions`)
  return allTxs
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
      .filter((output) => output.amount.some((amt) => amt.unit === registry.orderAssetId))
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
          utxo.data_hash ? blockfrost.getDatum(utxo.data_hash) : Promise.resolve(undefined),
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
        logger.error(error, `Error processing UTxO ${idx + 1}/${orderUTxOs.length}:`)
        throw error
      }
    },
    config.BATCH_SIZE_SMALL,
    config.BATCH_DELAY_SMALL,
  )
}

/**
 * process the order UTxOs to the suitable Order type to insert in the database
 * @param utxos array of Order UTxOs, with decoded datum
 * @returns array of Order objects to be inserted in the database
 */
async function processOrdersToInsert(utxos: OrderUTxOWithDatum[]) {
  return Promise.all(
    utxos.map(async (utxo) => {
      const d = utxo.orderDatum as OrderDatum
      const { action, token, paid, received } = await parseOrderDatum(utxo)
      const totalAmountPaid = BigInt(utxo.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0')
      const fees = action === 'Mint' ? totalAmountPaid - paid : totalAmountPaid

      return {
        address: d.address,
        tx_hash: utxo.tx_hash,
        out_index: utxo.output_index,
        block: utxo.block_hash,
        slot: utxo.block_slot,
        action,
        token,
        paid,
        fees,
        received,
        orderDate: new Date(Number(d.creationDate)),
        status: utxo.consumed_by_tx ? 'Completed' : 'Created',
      }
    }),
  )
}

/**
 * update the latest block in the database
 * @param latestSyncedBlock latest synced block
 * @param newBlocks array of new blocks
 * @returns latest synced block
 */
async function updateLatestBlock(latestSyncedBlock: { id: number }, newBlocks: Block[]) {
  if (newBlocks.length === 0) return latestSyncedBlock

  const latestBlock = newBlocks[newBlocks.length - 1]
  if (latestBlock) {
    await prisma.block.update({
      where: { id: latestSyncedBlock.id },
      data: { latestBlock: latestBlock.hash, latestSlot: latestBlock.slot },
    })
    logger.info(`New latest block: ${latestBlock.hash}`)
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
  logger.info('=== Syncing New Orders ===')

  const latestSyncedBlock = await prisma.block.findFirst()
  if (!latestSyncedBlock) {
    logger.warn('No synced block found in database, skipping. performing initial sync...')
    await populateDbWithHistoricOrders()
    return { id: 0, latestBlock: '', latestSlot: 0 }
  }
  logger.info(`Latest synced block: ${latestSyncedBlock.latestBlock}`)

  const tip = (await blockfrostFetch('/blocks/latest')) as Block

  const newBlocks = await fetchNewBlocks(latestSyncedBlock.latestBlock)
  if (newBlocks.length === 0) {
    logger.info('No new blocks to process')
    return latestSyncedBlock
  }

  const finalizedBlocks = newBlocks.filter((b) => tip.slot - b.slot >= config.SAFETY_MARGIN)
  if (finalizedBlocks.length === 0) {
    logger.info('No finalized blocks to process yet')
    return latestSyncedBlock
  }

  const blockHashes = finalizedBlocks.map((block) => block.hash)
  const transactions = await fetchTransactionsFromBlocks(blockHashes)
  if (transactions.length === 0) {
    logger.info('No new transactions since last sync')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  const orderUTxOs = await fetchOrderUTxOs(transactions)
  if (orderUTxOs.length === 0) {
    logger.info('No order UTxOs in new blocks')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  const orderUTxOsWithData: OrderUTxOWithDatum[] = await enrichUTxOsWithData(orderUTxOs)
  const ordersToInsert: Order[] = await processOrdersToInsert(orderUTxOsWithData)
  if (ordersToInsert.length === 0) {
    logger.info('No orders to insert')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })

  logger.info(`Successfully inserted ${ordersToInsert.length} new orders`)

  const latestBlock = finalizedBlocks[finalizedBlocks.length - 1]
  if (latestBlock) {
    await prisma.block.update({
      where: { id: latestSyncedBlock.id },
      data: { latestBlock: latestBlock.hash },
    })
    logger.info(`New latest block: ${latestBlock.hash}`)
  }
  return latestSyncedBlock
}
