import { Data } from '@lucid-evolution/lucid'
import { OrderDatum } from '@open-djed/data'
import { prisma } from '../lib/prisma'
import type { Block, UTxO, TransactionData, OrderUTxO, OrderUTxOWithDatum, Order } from './types'
import {
  registry,
  blockfrost,
  processBatch,
  parseOrderDatum,
  sleep,
  blockfrostFetch,
  SAFETY_MARGIN,
} from './utils'

/**
 * search the database for orders that have status 'Created', meaning that the order is yet to be fulfilled
 * having every unfulfilled order, query blockfrost to check if the corresponding UTxO has been spent
 * if the UTxO was consumed then the order was fulfilled and the order can be update to status 'Completed'
 * @returns
 */
async function updatePendingOrders() {
  console.log('=== Updating Pending Orders ===')

  const pendingOrders = await prisma.order.findMany({
    where: { status: 'Created' },
  })

  if (pendingOrders.length === 0) {
    console.log('No orders to update')
    return
  }
  console.log(`Found ${pendingOrders.length} pending orders to check.`)

  const orderStatusUpdates = await processBatch(
    pendingOrders,
    async (order) => {
      try {
        const utxo = (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
        const orderUTxOWithUnit = utxo.outputs.find(
          (output) =>
            output.address === registry.orderAddress &&
            output.amount.some((amt) => amt.unit === registry.orderAssetId),
        )

        const isConsumed = typeof orderUTxOWithUnit?.consumed_by_tx === 'string'

        return { tx_hash: order.tx_hash, isConsumed }
      } catch (error) {
        console.error(`Error checking order ${order.tx_hash}:`, error)
        return { tx_hash: order.tx_hash, isConsumed: false }
      }
    },
    10,
    100,
  )

  const completedOrders = orderStatusUpdates.filter((o) => o.isConsumed)

  if (completedOrders.length > 0) {
    console.log(`Marking ${completedOrders.length} orders as completed`)

    for (const order of completedOrders) {
      await prisma.order.update({
        where: { tx_hash: order.tx_hash },
        data: { status: 'Completed' },
      })
    }

    console.log(`Updated ${completedOrders.length} orders to Completed status`)
  } else {
    console.log('No pending orders were completed')
  }
}

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
  console.log(`Found ${blocks.length} new blocks`)
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
    10,
    150,
  )
  const allTxs = blockTxs.flat()
  console.log(`Found ${allTxs.length} transactions`)
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
    10,
    200,
  )
  const orderUTxOs: OrderUTxO[] = allUTxOs.flatMap((utxo) =>
    utxo.outputs
      .filter((output) => output.amount.some((amt) => amt.unit === registry.orderAssetId))
      .map((output) => ({ ...output, tx_hash: utxo.hash })),
  )
  console.log(`Found ${orderUTxOs.length} order UTxOs`)
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
        console.error(`Error processing UTxO ${idx + 1}/${orderUTxOs.length}:`, error)
        throw error
      }
    },
    5,
    300,
  )
}

/**
 * process the order UTxOs to the suitable Order type to insert in the database
 * @param utxos array of Order UTxOs, with decoded datum
 * @returns array of Order objects to be inserted in the database
 */
function processOrdersToInsert(utxos: OrderUTxOWithDatum[]) {
  return utxos.map((utxo) => {
    const d: OrderDatum = utxo.orderDatum
    const { action, token, paid, received } = parseOrderDatum(d)
    const totalAmountPaid = BigInt(utxo.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0')
    const fees = totalAmountPaid - paid

    return {
      address: d.address,
      tx_hash: utxo.tx_hash,
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
  })
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
    console.log(`New latest block: ${latestBlock.hash}`)
  }

  return latestSyncedBlock
}

/**
 * sync the database with the newly created orders
 * check every new block, within the safety margin, after the last sync, and get every new transaction
 * check the UTxOs of the new transactions to check if any new order was created
 * @returns
 */
async function syncNewOrders() {
  console.log('=== Syncing New Orders ===')

  const latestSyncedBlock = await prisma.block.findFirst()
  if (!latestSyncedBlock) {
    console.log('No synced block found. Run populateDbWithHistoricOrders first')
    return null
  }
  console.log('Latest synced block:', latestSyncedBlock.latestBlock)

  const tip = (await blockfrostFetch('/blocks/latest')) as Block

  const newBlocks = await fetchNewBlocks(latestSyncedBlock.latestBlock)
  if (newBlocks.length === 0) {
    console.log('No new blocks to process')
    return latestSyncedBlock
  }

  const finalizedBlocks = newBlocks.filter((b) => tip.slot - b.slot >= SAFETY_MARGIN)
  if (finalizedBlocks.length === 0) {
    console.log('No finalized blocks to process yet')
    return latestSyncedBlock
  }

  const blockHashes = finalizedBlocks.map((block) => block.hash)
  const transactions = await fetchTransactionsFromBlocks(blockHashes)
  if (transactions.length === 0) {
    console.log('No new transactions since last sync')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  const orderUTxOs = await fetchOrderUTxOs(transactions)
  if (orderUTxOs.length === 0) {
    console.log('No order UTxOs in new blocks')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  const orderUTxOsWithData: OrderUTxOWithDatum[] = await enrichUTxOsWithData(orderUTxOs)
  const ordersToInsert: Order[] = processOrdersToInsert(orderUTxOsWithData)
  if (ordersToInsert.length === 0) {
    console.log('No orders to insert')
    return updateLatestBlock(latestSyncedBlock, finalizedBlocks)
  }

  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })

  console.log(`Successfully inserted ${ordersToInsert.length} new orders`)

  const latestBlock = finalizedBlocks[finalizedBlocks.length - 1]
  if (latestBlock) {
    await prisma.block.update({
      where: { id: latestSyncedBlock.id },
      data: { latestBlock: latestBlock.hash },
    })
    console.log(`New latest block: ${latestBlock.hash}`)
  }
  return latestSyncedBlock
}

/**
 * if a finalized block disappears from the blockchain, a rollback has occurred
 * if that happens, go through
 * @returns
 */
async function rollback() {
  const sync = await prisma.block.findFirst()
  if (!sync) return

  const syncIsValid = await blockfrostFetch(`/blocks/${sync.latestBlock}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    console.log('No rollback detected')
    return
  }

  console.log('Checking rollback from:', sync.latestBlock)

  const storedBlocks = await prisma.order.findMany({
    where: { slot: { lte: sync.latestSlot } },
    select: { block: true, slot: true },
    orderBy: { slot: 'desc' },
    distinct: ['block'],
  })

  for (const b of storedBlocks) {
    const exists = await ((await blockfrostFetch(`/blocks/${b.block}`)) as Promise<Block>)
      .then(() => true)
      .catch(() => false)

    if (exists) {
      console.log('Rollback anchor found at block', b.block, 'slot', b.slot)

      await prisma.order.deleteMany({
        where: { slot: { gt: b.slot } },
      })

      await prisma.block.update({
        where: { id: sync.id },
        data: {
          latestBlock: b.block,
          latestSlot: b.slot,
        },
      })

      console.log('Rollback completed')
      return
    }
  }

  throw new Error('Rollback exceeds DB history — full resync required')
}

export async function updateOrders() {
  const start = Date.now()
  console.log('=== Starting Order Update Process ===')

  try {
    await rollback()
    await updatePendingOrders()
    await syncNewOrders()

    console.log('\n=== Order Update Complete ===')
    const end = Date.now() - start
    console.log('Time sec:', (end / 1000).toFixed(2))
  } catch (error) {
    console.error('Error during order update:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
