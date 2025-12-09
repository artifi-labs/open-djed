import { OrderDatum } from '@open-djed/data'
import { Data } from '@lucid-evolution/lucid'
import { prisma } from '../lib/prisma'
import type { Transaction, UTxO } from './types'
import {
  fetchWithRetry,
  processBatch,
  parseOrderDatum,
  registry,
  blockfrost,
  blockfrostId,
  blockfrostUrl,
} from './utils'

export const populateDbWithHistoricOrders = async () => {
  const start = Date.now()

  console.log('Fetching all transaction...')
  const everyOrderTx: Transaction[] = []
  let txPage = 1
  while (true) {
    try {
      const pageResult: Transaction[] = await fetchWithRetry(
        `${blockfrostUrl}/addresses/${registry.orderAddress}/transactions?page=${txPage}&count=100`,
        { headers: { project_id: blockfrostId } },
      )

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      everyOrderTx.push(...pageResult)
      txPage++
    } catch (error) {
      console.error(`Error fetching page ${txPage}:`, error)
      break
    }
  }

  if (everyOrderTx.length === 0) {
    console.log('No transactions found')
    return
  }
  console.log(`Found ${everyOrderTx.length} transactions`)

  console.log('Fetching UTxOs...')
  const everyOrderUTxO: UTxO[] = await processBatch(
    everyOrderTx,
    async (order) => {
      try {
        return await fetchWithRetry(`${blockfrostUrl}/txs/${order.tx_hash}/utxos`, {
          headers: { project_id: blockfrostId },
        })
      } catch (error) {
        console.error(`Error fetching UTxO for tx ${order.tx_hash}:`, error)
        throw error
      }
    },
    10,
    40, // 40ms wait
  )

  const orderUTxOsWithUnit = everyOrderUTxO.flatMap((utxo) =>
    utxo.outputs
      .filter((output) => output.amount.some((amt) => amt.unit === registry.orderAssetId))
      .map((output) => ({
        ...output,
        tx_hash: utxo.hash,
      })),
  )

  if (orderUTxOsWithUnit.length === 0) {
    console.log('No order UTxOs found')
    return
  }
  console.log(`Found ${orderUTxOsWithUnit.length} order UTxOs`)

  console.log('Fetching datums and transaction data...')
  const orderUTxOWithDatumAndBlock = await processBatch(
    orderUTxOsWithUnit,
    async (utxo, idx) => {
      try {
        const [rawDatum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash).catch((err) => {
                console.error(`Error fetching datum for ${utxo.data_hash}:`, err)
                throw err
              })
            : Promise.resolve(undefined),
          fetchWithRetry(`${blockfrostUrl}/txs/${utxo.tx_hash}`, { headers: { project_id: blockfrostId } }),
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
        console.error(`Error processing UTxO ${idx + 1}/${orderUTxOsWithUnit.length}:`, error)
        throw error
      }
    },
    5,
    300,
  )

  console.log('Processing order data...')

  const ordersToInsert = orderUTxOWithDatumAndBlock.map((utxo) => {
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

  console.log(`Inserting ${ordersToInsert.length} orders into database...`)
  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })
  console.log(`Historic orders sync complete. Inserted ${ordersToInsert.length} orders`)

  // Fetch and store latest block
  const latestBlock = await fetchWithRetry(`${blockfrostUrl}/blocks/latest`, {
    headers: { project_id: blockfrostId },
  })
  await prisma.block.create({
    data: { latest_block: latestBlock.hash },
  })
  console.log('Latest block:', latestBlock.hash)

  const end = Date.now() - start
  console.log('Time sec:', (end / 1000).toFixed(2))
}

await populateDbWithHistoricOrders()
