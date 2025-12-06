import { Blockfrost } from '@open-djed/blockfrost'
import { OrderDatum } from '@open-djed/data'
import { Data } from '@lucid-evolution/lucid'
import { registryByNetwork } from '@open-djed/registry'
import type { Actions, Token } from '../generated/prisma/enums'
import { prisma } from '../lib/prisma'
import type { Transaction, UTxO } from './types'

const blockfrostUrl = process.env.BLOCKFROST_URL || ''
const blockfrostId = process.env.BLOCKFROST_PROJECT_ID || ''
const blockfrost = new Blockfrost(blockfrostUrl, blockfrostId)
const registry = registryByNetwork['Preprod']

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

  const orderUTxOWithDatum = []

  for (const utxo of orderUTxOsWithUnit) {
    await sleep(50)

    const rawDatum = utxo.data_hash ? await blockfrost.getDatum(utxo.data_hash) : undefined

    if (!rawDatum) throw new Error(`Couldn't get order datum.`)

    orderUTxOWithDatum.push({
      ...utxo,
      orderDatum: Data.from(rawDatum, OrderDatum),
    })
  }

  const ordersToInsert = []

  for (const utxo of orderUTxOWithDatum) {
    const d: OrderDatum = utxo.orderDatum

    const { action, token, paid, received } = parseOrderDatum(d)

    const totalAmountPaid = BigInt(utxo.amount.find((a) => a.unit === 'lovelace')?.quantity ?? '0')

    const fees = totalAmountPaid - paid

    ordersToInsert.push({
      address: utxo.address,
      tx_hash: utxo.tx_hash,
      action,
      token,
      paid,
      fees,
      received,
      orderDate: new Date(Number(d.creationDate)),
      status: utxo.consumed_by_tx ? 'Completed' : 'Created',
    })
  }

  const existing = await prisma.order.findMany({
    where: {
      tx_hash: {
        in: ordersToInsert.map((r) => r.tx_hash),
      },
    },
    select: { tx_hash: true },
  })

  const existingHashes = new Set(existing.map((e) => e.tx_hash))

  const finalRows = ordersToInsert.filter((r) => !existingHashes.has(r.tx_hash))

  if (finalRows.length > 0) {
    await prisma.order.createMany({
      data: finalRows,
      skipDuplicates: true,
    })
  }

  console.log(`Historic orders sync complete. Inserted ${finalRows.length} orders`)
}
