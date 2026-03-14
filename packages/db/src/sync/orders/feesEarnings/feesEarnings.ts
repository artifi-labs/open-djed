import { djedADARate, Rational, shenADARate } from "@open-djed/math"
import type {
  ADAFeesEarnings,
  OrderUTxOWithDatumAndBlock,
  OrderUTxOWithPoolDatum,
} from "../../types"
import { hasPoolDatum, toDayString } from "../../utils"

type PoolState = Pick<
  OrderUTxOWithPoolDatum["poolDatum"],
  "adaInReserve" | "djedInCirculation" | "shenInCirculation"
>

const applyOrderToPoolState = (
  state: PoolState,
  order: OrderUTxOWithPoolDatum,
): void => {
  const oracle = {
    oracleFields: {
      adaUSDExchangeRate: order.orderDatum.adaUSDExchangeRate,
    },
  }

  // Minting DJED increases both reserve ADA and DJED supply at the oracle rate.
  if ("MintDJED" in order.orderDatum.actionFields) {
    const baseAda = djedADARate(oracle)
      .mul(order.orderDatum.actionFields.MintDJED.djedAmount)
      .toBigInt()
    state.adaInReserve += baseAda
    state.djedInCirculation += order.orderDatum.actionFields.MintDJED.djedAmount
    return
  }

  // Burning DJED decreases both reserve ADA and DJED supply at the oracle rate.
  if ("BurnDJED" in order.orderDatum.actionFields) {
    const baseAda = djedADARate(oracle)
      .mul(order.orderDatum.actionFields.BurnDJED.djedAmount)
      .toBigInt()
    state.adaInReserve -= baseAda
    state.djedInCirculation -= order.orderDatum.actionFields.BurnDJED.djedAmount
    return
  }

  const shenRate = shenADARate(state, oracle)

  // Minting SHEN increases reserve ADA and SHEN supply using the current SHEN rate.
  if ("MintSHEN" in order.orderDatum.actionFields) {
    const baseAda = shenRate
      .mul(order.orderDatum.actionFields.MintSHEN.shenAmount)
      .toBigInt()
    state.adaInReserve += baseAda
    state.shenInCirculation += order.orderDatum.actionFields.MintSHEN.shenAmount
    return
  }

  // Burning SHEN decreases reserve ADA and SHEN supply using the current SHEN rate.
  if ("BurnSHEN" in order.orderDatum.actionFields) {
    const baseAda = shenRate
      .mul(order.orderDatum.actionFields.BurnSHEN.shenAmount)
      .toBigInt()
    state.adaInReserve -= baseAda
    state.shenInCirculation -= order.orderDatum.actionFields.BurnSHEN.shenAmount
  }
}

export const calculateFeesEarnings = (
  orders: OrderUTxOWithDatumAndBlock[],
): ADAFeesEarnings[] => {
  const ordersByConsumingTx = new Map<string, OrderUTxOWithPoolDatum[]>()

  // Fees are computed per consuming transaction, so orders are grouped by the tx that consumed them.
  for (const order of orders) {
    if (typeof order.consumed_by_tx !== "string" || !hasPoolDatum(order)) {
      continue
    }

    const txOrders = ordersByConsumingTx.get(order.consumed_by_tx) ?? []
    txOrders.push(order)
    ordersByConsumingTx.set(order.consumed_by_tx, txOrders)
  }

  const orderedTxGroups = [...ordersByConsumingTx.entries()]
    .filter(([, txOrders]) => txOrders.length > 0)
    .sort(([, a], [, b]) =>
      Number(
        a[0].poolDatum.lastOrder[0].time - b[0].poolDatum.lastOrder[0].time,
      ),
    )

  const dailyFees = new Map<string, ADAFeesEarnings>()

  for (let i = 1; i < orderedTxGroups.length; i++) {
    const previousGroup = orderedTxGroups[i - 1]
    const currentGroup = orderedTxGroups[i]

    if (!previousGroup || !currentGroup) {
      continue
    }

    const previousOrders = previousGroup[1]
    const currentOrders = currentGroup[1]
    const inputPool = previousOrders[0]?.poolDatum
    const outputPool = currentOrders[0]?.poolDatum

    if (!inputPool || !outputPool) {
      continue
    }

    const expectedPool: PoolState = {
      adaInReserve: inputPool.adaInReserve,
      djedInCirculation: inputPool.djedInCirculation,
      shenInCirculation: inputPool.shenInCirculation,
    }

    // Apply the order referenced by 'lastOrder' last, and sort the rest by creation time.
    const lastOrderRef = outputPool.lastOrder[0].order
    const txOrders = [...currentOrders].sort((a, b) => {
      const aIsLast =
        a.tx_hash === lastOrderRef.txHash[0] &&
        a.output_index === Number(lastOrderRef.outputIndex)
      const bIsLast =
        b.tx_hash === lastOrderRef.txHash[0] &&
        b.output_index === Number(lastOrderRef.outputIndex)

      if (aIsLast && !bIsLast) return 1
      if (!aIsLast && bIsLast) return -1

      return Number(a.orderDatum.creationDate - b.orderDatum.creationDate)
    })

    for (const order of txOrders) {
      applyOrderToPoolState(expectedPool, order)
    }

    const feeLovelace = outputPool.adaInReserve - expectedPool.adaInReserve
    if (feeLovelace <= 0n) {
      continue
    }

    const lastOrder = txOrders[txOrders.length - 1]
    if (!lastOrder) {
      continue
    }

    const dayKey = toDayString(new Date(Number(outputPool.lastOrder[0].time)))
    const feeAda = new Rational(feeLovelace).div(1_000_000n).toNumber()
    const existing = dailyFees.get(dayKey)

    if (existing) {
      existing.fee += feeAda
      existing.block = lastOrder.block_hash
      existing.slot = lastOrder.block_slot
      continue
    }

    dailyFees.set(dayKey, {
      timestamp: new Date(`${dayKey}T00:00:00.000Z`),
      fee: feeAda,
      block: lastOrder.block_hash,
      slot: lastOrder.block_slot,
    })
  }

  return [...dailyFees.values()]
}
