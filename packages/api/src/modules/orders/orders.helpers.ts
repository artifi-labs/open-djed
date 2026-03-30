import { Data } from "@lucid-evolution/lucid"
import { type Order } from "@open-djed/db"
import { type OrderUTxO } from "@open-djed/txs"
import { OrderDatum } from "@open-djed/data"
import { blockfrost, chainDataCache, registry } from "../../core"
import { DatumDecodeError } from "../../shared"

type ActionFields =
  | { MintDJED: { djedAmount: bigint; adaAmount: bigint } }
  | { BurnDJED: { djedAmount: bigint } }
  | { MintSHEN: { adaAmount: bigint; shenAmount: bigint } }
  | { BurnSHEN: { shenAmount: bigint } }

const parseActionFields = (actionFields: ActionFields) => {
  if ("MintDJED" in actionFields) {
    return {
      action: "Mint" as const,
      token: "DJED" as const,
      paid: actionFields.MintDJED.adaAmount,
      received: actionFields.MintDJED.djedAmount,
    }
  }

  if ("BurnDJED" in actionFields) {
    return {
      action: "Burn" as const,
      token: "DJED" as const,
      paid: actionFields.BurnDJED.djedAmount,
      received: null,
    }
  }

  if ("MintSHEN" in actionFields) {
    return {
      action: "Mint" as const,
      token: "SHEN" as const,
      paid: actionFields.MintSHEN.adaAmount,
      received: actionFields.MintSHEN.shenAmount,
    }
  }

  if ("BurnSHEN" in actionFields) {
    return {
      action: "Burn" as const,
      token: "SHEN" as const,
      paid: actionFields.BurnSHEN.shenAmount,
      received: null,
    }
  }

  throw new Error("Unknown actionFields variant")
}

const getDatum = async (datumHash: string, errorMessage: string) => {
  try {
    return await blockfrost.getDatum(datumHash)
  } catch {
    throw new DatumDecodeError(errorMessage)
  }
}

export const getOrderUTxOs = async () => {
  const cached = chainDataCache.get<OrderUTxO[]>("orderUTxOs")
  if (cached) return cached
  const rawOrderUTxOs = await blockfrost.getUtxosWithUnit(
    registry.orderAddress,
    registry.orderAssetId,
  )
  const orderUTxOs = await Promise.all(
    rawOrderUTxOs.map(async (rawOrderUTxO) => {
      const rawDatum =
        rawOrderUTxO.datum ??
        (rawOrderUTxO.datumHash
          ? await getDatum(
              rawOrderUTxO.datumHash,
              "Failed to get an order datum.",
            )
          : undefined)
      if (!rawDatum)
        throw new DatumDecodeError("Failed to decode a order datum.")
      return {
        ...rawOrderUTxO,
        orderDatum: Data.from(rawDatum, OrderDatum),
      }
    }),
  )
  chainDataCache.set("orderUTxOs", orderUTxOs)
  return orderUTxOs
}

export const parseOrderUTxOsToOrder = (orderUTxO: OrderUTxO): Order => {
  const { txHash, outputIndex, orderDatum } = orderUTxO

  const { action, token, paid, received } = parseActionFields(
    orderDatum.actionFields,
  )

  return {
    status: "Created",
    fees: null,
    action,
    address: orderDatum.address,
    paid: paid,
    received: received,
    token,
    id: Number(orderDatum.creationDate),
    tx_hash: txHash,
    out_index: outputIndex,
    block: "",
    slot: 0n,
    orderDate: new Date(Number(orderDatum.creationDate)),
  }
}
