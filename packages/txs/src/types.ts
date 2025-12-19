import type { UTxO } from "@lucid-evolution/lucid"
import type { OracleDatum, OrderDatum, PoolDatum } from "@open-djed/data"

export type OrderUTxO = UTxO & { orderDatum: OrderDatum }

export type OracleUTxO = UTxO & { oracleDatum: OracleDatum }

export type PoolUTxO = UTxO & { poolDatum: PoolDatum }
