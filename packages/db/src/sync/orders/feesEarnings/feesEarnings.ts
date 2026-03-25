import { djedADARate, Rational, shenADARate } from "@open-djed/math"
import { PoolDatum } from "@open-djed/data"
import { Data } from "@lucid-evolution/lucid"
import type {
  ADAFeesEarnings,
  OrderUTxOWithDatumAndBlock,
  OrderUTxOWithPoolDatum,
  UTxO,
} from "../../types"
import {
  blockfrost,
  blockfrostFetch,
  hasPoolDatum,
  processBatch,
  registry,
  toDayString,
} from "../../utils"

type PoolState = Pick<
  OrderUTxOWithPoolDatum["poolDatum"],
  "adaInReserve" | "djedInCirculation" | "shenInCirculation"
>

type DailyFees = Omit<ADAFeesEarnings, "fee" | "rate"> & {
  fee: Rational
  rate: Rational
}

const createZeroFeeDay = (timestamp: string): ADAFeesEarnings => ({
  timestamp: new Date(timestamp),
  fee: 0,
  rate: 0,
})

export const fillMissingFeeDays = (
  dailyFees: ADAFeesEarnings[],
  endDate: Date = new Date(),
) => {
  if (dailyFees.length === 0) return []

  const feeMap = new Map(dailyFees.map((entry) => [toDayString(entry.timestamp), entry]))
  const allDates = dailyFees.map((entry) => entry.timestamp)
  const minDate = new Date(Math.min(...allDates.map((date) => date.getTime())))
  minDate.setUTCHours(0, 0, 0, 0)

  const maxDate = new Date(endDate)
  maxDate.setUTCHours(0, 0, 0, 0)

  const completeFees: ADAFeesEarnings[] = []
  const currentDate = new Date(minDate)

  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    if (!dateStr) return []

    completeFees.push(feeMap.get(dateStr) ?? createZeroFeeDay(dateStr))
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return completeFees
}

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

export const calculateFeesEarnings = async (
  orders: OrderUTxOWithDatumAndBlock[],
): Promise<ADAFeesEarnings[]> => {
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

  const consumingTxHashes = [...ordersByConsumingTx.keys()]

  // Fetch the pool datum from the pool input of each consuming tx so the
  // fee calculation starts from the pool state consumed by that tx.
  const inputPoolByTx = new Map(
    (
      await processBatch(
        consumingTxHashes,
        async (consumingTxHash) => {
          try {
            const consumingTx = (await blockfrostFetch(
              `/txs/${consumingTxHash}/utxos`,
            )) as UTxO

            const poolInputDataHash = consumingTx.inputs.find(
              (input) =>
                input.address === registry.poolAddress &&
                typeof input.data_hash === "string",
            )?.data_hash

            if (!poolInputDataHash) {
              return null
            }

            return [
              consumingTxHash,
              Data.from(
                await blockfrost.getDatum(poolInputDataHash),
                PoolDatum,
              ),
            ] as const
          } catch {
            return null
          }
        },
        5,
        300,
      )
    ).filter(
      (
        entry,
      ): entry is readonly [string, OrderUTxOWithPoolDatum["poolDatum"]] =>
        entry !== null,
    ),
  )

  const orderedTxGroups = [...ordersByConsumingTx.entries()]
    .filter(([, txOrders]) => txOrders.length > 0)
    .sort(([, a], [, b]) =>
      Number(
        a[0].poolDatum.lastOrder[0].time - b[0].poolDatum.lastOrder[0].time,
      ),
    )

  const dailyFees = new Map<string, DailyFees>()

  for (let i = 0; i < orderedTxGroups.length; i++) {
    const currentGroup = orderedTxGroups[i]

    if (!currentGroup) {
      continue
    }

    const currentOrders = currentGroup[1]
    const inputPool = inputPoolByTx.get(currentGroup[0])
    const outputPool = currentOrders[0]?.poolDatum

    if (!inputPool || !outputPool) {
      continue
    }

    const expectedPoolWithoutFees: PoolState = {
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
      applyOrderToPoolState(expectedPoolWithoutFees, order)
    }

    const feeLovelace =
      outputPool.adaInReserve - expectedPoolWithoutFees.adaInReserve
    if (feeLovelace <= 0n) {
      throw new Error(
        `Invalid fee calculation for tx ${currentGroup[0]}: feeLovelace=${feeLovelace}, expectedReserve=${expectedPoolWithoutFees.adaInReserve}, outputReserve=${outputPool.adaInReserve}`,
      )
    }

    if (outputPool.adaInReserve <= 0n) {
      throw new Error(
        `Invalid output pool reserve for tx ${currentGroup[0]}: outputReserve=${outputPool.adaInReserve}`,
      )
    }

    const lastOrder = txOrders[txOrders.length - 1]
    if (!lastOrder) {
      continue
    }

    const dayKey = toDayString(new Date(Number(outputPool.lastOrder[0].time)))
    const feeAda = new Rational(feeLovelace).div(1_000_000n)
    const feeRate = new Rational(feeLovelace)
      .mul(100n)
      .div(outputPool.adaInReserve)
    const existing = dailyFees.get(dayKey)

    if (existing) {
      existing.fee = existing.fee.add(feeAda)
      existing.rate = existing.rate.add(feeRate)
      existing.block = lastOrder.block_hash
      existing.slot = lastOrder.block_slot
      continue
    }

    dailyFees.set(dayKey, {
      timestamp: new Date(dayKey),
      fee: feeAda,
      rate: feeRate,
      block: lastOrder.block_hash,
      slot: lastOrder.block_slot,
    })
  }

  const calculatedFees = [...dailyFees.values()].map((entry) => ({
    ...entry,
    fee: entry.fee.toNumber(),
    rate: entry.rate.toNumber(),
  }))

  const completeFees = fillMissingFeeDays(calculatedFees)

  return completeFees
}
