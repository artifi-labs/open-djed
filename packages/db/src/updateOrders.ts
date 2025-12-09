import { Data } from '@lucid-evolution/lucid'
import { OrderDatum } from '@open-djed/data'
import { prisma } from '../lib/prisma'
import type { Block, UTxO, TransactionData, OrderUTxO, OrderUTxOWithDatum, Order } from './types'
import {
  blockfrostUrl,
  blockfrostId,
  registry,
  blockfrost,
  fetchWithRetry,
  processBatch,
  parseOrderDatum,
  sleep,
} from './utils'

// search the database for orders that have status 'Created', meaning that the order is yet to be fulfilled
// having every unfulfilled order, query blockfrost to check if the corresponding UTxO has been spent
// if the UTxO was consumed then the order was fulfilled and the order can be update to status 'Completed'
async function updatePendingOrders() {
  console.log('=== Updating Pending Orders ===')

  const pendingOrders = await prisma.order.findMany({
    where: { status: 'Created' },
  })

  if (pendingOrders.length === 0) {
    console.log('No orders to update')
    return
  }
  console.log(`Found ${pendingOrders.length} pending orders to check`)

  const orderStatusUpdates = await processBatch(
    pendingOrders,
    async (order) => {
      try {
        const utxo: UTxO = await fetchWithRetry(`${blockfrostUrl}/txs/${order.tx_hash}/utxos`, {
          headers: { project_id: blockfrostId },
        })

        const orderUTxOWithUnit = utxo.outputs.find(
          (output) =>
            output.address === order.address &&
            output.amount.some((amt) => amt.unit === registry.orderAssetId),
        )

        const isConsumed = orderUTxOWithUnit?.consumed_by_tx !== undefined

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

async function fetchNewBlocks(latestBlockHash: string): Promise<Block[]> {
  const blocks: Block[] = []
  let page = 1
  while (true) {
    const pageResult: Block[] = await fetchWithRetry(
      `${blockfrostUrl}/blocks/${latestBlockHash}/next?page=${page}&count=100`,
      { headers: { project_id: blockfrostId } },
    )

    if (!Array.isArray(pageResult) || pageResult.length === 0) break

    blocks.push(...pageResult)
    page++

    await sleep(50)
  }
  console.log(`Found ${blocks.length} new blocks`)
  return blocks
}

// get every transaction present in a given set of blocks
async function fetchTransactionsFromBlocks(blockHashes: string[]): Promise<string[]> {
  const blockTxs = await processBatch(
    blockHashes,
    async (hash) => {
      const txs: string[] = await fetchWithRetry(`${blockfrostUrl}/blocks/${hash}/txs`, {
        headers: { project_id: blockfrostId },
      })
      return txs
    },
    10,
    150,
  )
  const allTxs = blockTxs.flat()
  console.log(`Found ${allTxs.length} transactions`)
  return allTxs
}

// get the UTxOs of a set of transactions
// filter the UTxOs to check if any references the DjedOrderTicket
// any UTxO that references the DjedOrderTicket, represents a new order UTxO
async function fetchOrderUTxOs(txHashes: string[]) {
  const allUTxOs = await processBatch(
    txHashes,
    async (tx) => {
      const utxo: UTxO = await fetchWithRetry(`${blockfrostUrl}/txs/${tx}/utxos`, {
        headers: { project_id: blockfrostId },
      })
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

// decodes the datum of each order UTxO and retrieves the hash of the block where the transaction was included
async function enrichUTxOsWithData(orderUTxOs: OrderUTxO[]) {
  return await processBatch(
    orderUTxOs,
    async (utxo, idx) => {
      try {
        const [rawDatum, tx] = await Promise.all([
          utxo.data_hash ? blockfrost.getDatum(utxo.data_hash) : Promise.resolve(undefined),
          fetchWithRetry(`${blockfrostUrl}/txs/${utxo.tx_hash}`, {
            headers: { project_id: blockfrostId },
          }) as Promise<TransactionData>,
        ])

        if (!rawDatum) {
          throw new Error(`Couldn't get order datum for ${utxo.tx_hash}`)
        }

        return {
          ...utxo,
          orderDatum: Data.from(rawDatum, OrderDatum),
          block_hash: tx.block,
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

// process the order UTxOs to the suitable Order type to insert in the database
function processOrdersToInsert(utxos: OrderUTxOWithDatum[]) {
  return utxos.map((utxo) => {
    const d: OrderDatum = utxo.orderDatum
    const { action, token, paid, received } = parseOrderDatum(d)
    const totalAmountPaid = BigInt(utxo.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0')
    const fees = totalAmountPaid - paid

    return {
      address: utxo.address,
      tx_hash: utxo.tx_hash,
      block: utxo.block_hash,
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

// sync the database with the newly created orders
// check every new block, after the last sync, and get every new transaction
// check the UTxOs of the new transactions to check if any new order was created
async function syncNewOrders() {
  console.log('=== Syncing New Orders ===')

  const latestSyncedBlock = await prisma.block.findFirst()
  if (!latestSyncedBlock) {
    console.log('No synced block found. Run populateDbWithHistoricOrders first')
    return null
  }
  console.log('Latest synced block:', latestSyncedBlock.latest_block)

  const newBlocks = await fetchNewBlocks(latestSyncedBlock.latest_block)
  if (newBlocks.length === 0) {
    console.log('No new blocks to process')
    return latestSyncedBlock
  }

  const blockHashes = newBlocks.map((block) => block.hash)
  const transactions = await fetchTransactionsFromBlocks(blockHashes)
  if (transactions.length === 0) {
    console.log('No new transactions since last sync')
    // sync db to last queried block
    const latestBlock = newBlocks[newBlocks.length - 1]
    if (latestBlock) {
      await prisma.block.update({
        where: { id: latestSyncedBlock.id },
        data: { latest_block: latestBlock.hash },
      })
    }
    return latestSyncedBlock
  }

  const orderUTxOs = await fetchOrderUTxOs(transactions)
  if (orderUTxOs.length === 0) {
    console.log('No order UTxOs in new blocks')
    // sync db to last queried block
    const latestBlock = newBlocks[newBlocks.length - 1]
    if (latestBlock) {
      await prisma.block.update({
        where: { id: latestSyncedBlock.id },
        data: { latest_block: latestBlock.hash },
      })
    }
    return latestSyncedBlock
  }

  const orderUTxOsWithData: OrderUTxOWithDatum[] = await enrichUTxOsWithData(orderUTxOs)
  const ordersToInsert: Order[] = processOrdersToInsert(orderUTxOsWithData)
  if (ordersToInsert.length === 0) {
    console.log('No orders to insert')
    // sync db to last queried block
    const latestBlock = newBlocks[newBlocks.length - 1]
    if (latestBlock) {
      await prisma.block.update({
        where: { id: latestSyncedBlock.id },
        data: { latest_block: latestBlock.hash },
      })
    }
    return latestSyncedBlock
  }

  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })

  console.log(`Successfully inserted ${ordersToInsert.length} new orders`)

  const latestBlock = newBlocks[newBlocks.length - 1]
  if (latestBlock) {
    await prisma.block.update({
      where: { id: latestSyncedBlock.id },
      data: { latest_block: latestBlock.hash },
    })
    console.log(`New latest block: ${latestBlock.hash}`)
  }
  return latestSyncedBlock
}

export async function updateOrders() {
  const start = Date.now()
  console.log('=== Starting Order Update Process ===')

  try {
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
