import { Blockfrost } from '@open-djed/blockfrost'
import { OrderDatum } from '@open-djed/data'
import { Data } from '@lucid-evolution/lucid'
import { registryByNetwork } from '@open-djed/registry'
import type { Actions, Token } from '../generated/prisma/enums'
import { prisma } from '../lib/prisma'
import type { Block, Transaction, TransactionData, UTxO } from './types'
import { env } from '../lib/env'

const blockfrostUrl = env.BLOCKFROST_URL
const blockfrostId = env.BLOCKFROST_PROJECT_ID
const blockfrost = new Blockfrost(blockfrostUrl, blockfrostId)
const network = env.NETWORK
const registry = registryByNetwork[network]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function parseOrderDatum(d: OrderDatum) {
  const entries = Object.entries(d.actionFields)

  if (entries.length === 0) {
    throw new Error('OrderDatum has no actionFields')
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const [actionName, values] = entries[0]!

  const action: Actions = actionName.startsWith('Mint') ? 'Mint' : 'Burn'

  let token: Token
  if (actionName.includes('SHEN')) token = 'SHEN'
  else if (actionName.includes('DJED')) token = 'DJED'
  else token = 'BOTH'

  const paid: bigint = values.adaAmount ?? 0n

  let received: bigint = 0n

  if ('shenAmount' in values && typeof values.shenAmount === 'bigint') {
    received += values.shenAmount
  }
  if ('djedAmount' in values && typeof values.djedAmount === 'bigint') {
    received += values.djedAmount
  }

  return {
    action,
    token,
    paid,
    received,
  }
}

export const populateDbWithHistoricOrders = async () => {
  const everyOrderTx: Transaction[] = []
  let txPage = 1
  while (true) {
    const pageResult: Transaction[] = await fetch(
      `${blockfrostUrl}/addresses/${registry.orderAddress}/transactions?page=${txPage}`,
      { headers: { project_id: blockfrostId } },
    ).then((res) => res.json())
    if (!Array.isArray(pageResult) || pageResult.length === 0) break

    everyOrderTx.push(...pageResult)
    txPage++
  }

  const everyOrderUTxO: UTxO[] = await Promise.all(
    everyOrderTx.map(async (order) => {
      const orderUTxO: UTxO = await fetch(`${blockfrostUrl}/txs/${order.tx_hash}/utxos`, {
        headers: { project_id: blockfrostId },
      }).then((res) => res.json())

      return orderUTxO ?? null
    }),
  )

  const orderUTxOsWithUnit = everyOrderUTxO.flatMap((utxo) =>
    utxo.outputs
      .filter((output) => output.amount.some((amt) => amt.unit === registry.orderAssetId))
      .map((output) => ({
        ...output,
        tx_hash: utxo.hash,
      })),
  )

  const orderUTxOWithDatumAndBlock = []

  for (const utxo of orderUTxOsWithUnit) {
    await sleep(50) // to avoid being rate-limited

    const rawDatum = utxo.data_hash ? await blockfrost.getDatum(utxo.data_hash) : undefined
    if (!rawDatum) throw new Error(`Couldn't get order datum.`)

    const tx = await fetch(`${blockfrostUrl}/txs/${utxo.tx_hash}`, {
      headers: { project_id: blockfrostId },
    }).then((res) => res.json() as Promise<TransactionData>)

    orderUTxOWithDatumAndBlock.push({
      ...utxo,
      orderDatum: Data.from(rawDatum, OrderDatum),
      block_hash: tx.block,
    })
  }

  const ordersToInsert = []

  for (const utxo of orderUTxOWithDatumAndBlock) {
    const d: OrderDatum = utxo.orderDatum

    const { action, token, paid, received } = parseOrderDatum(d)

    const totalAmountPaid = BigInt(utxo.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0')

    const fees = totalAmountPaid - paid

    ordersToInsert.push({
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
    })
  }

  console.log('To Insert: ', ordersToInsert[0])

  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })

  console.log(`Historic orders sync complete. Inserted ${ordersToInsert.length} orders`)

  const latestBlock = await fetch(`${blockfrostUrl}/blocks/latest`, {
    headers: { project_id: blockfrostId },
  }).then((res) => res.json() as Promise<Block>)

  await prisma.block.create({
    data: { latest_block: latestBlock.hash },
  })

  console.log('Latest block: ', latestBlock)
}

await populateDbWithHistoricOrders()
