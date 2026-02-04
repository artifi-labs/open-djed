import type { OrderDatum, PoolDatum, OracleDatum } from "@open-djed/data"
import type { Actions, Token } from "../../generated/prisma/enums"

export type Transaction = {
  tx_hash: string
  tx_index: number
  block_height: number
  block_time: number
}

export type Amount = {
  quantity: string
  unit: string
}

export type Input = {
  address: string
  amount: Amount[]
  collateral: boolean
  data_hash: string | null
  inline_datum: string | null
  output_index: number
  reference_script_hash: string | null
  tx_hash: string
  reference?: boolean
}

export type Output = {
  address: string
  amount: Amount[]
  collateral: boolean
  data_hash: string | null
  inline_datum: string | null
  output_index: number
  reference_script_hash: string | null
  consumed_by_tx: string | null
}

export type OrderUTxO = Output & { tx_hash: string }

export type OrderUTxOWithDatum = Output & {
  tx_hash: string
  orderDatum: OrderDatum
  block_hash: string
  block_slot: number
}

export type AddressDatum = {
  paymentKeyHash: string[]
  stakeKeyHash: string[][][]
}

export type Order = {
  id?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any
  tx_hash: string
  out_index: number
  block: string
  slot: bigint | number
  action: Actions
  token: Token
  paid: bigint | null
  fees: bigint | null
  received: bigint | undefined | null
  orderDate: Date
  status: string | null
}

export type UTxO = {
  hash: string
  inputs: Input[]
  outputs: Output[]
}

export type TransactionData = {
  hash: string
  block: string
  block_height: number
  block_time: number
  slot: number
  index: number
  output_amount: {
    unit: string
    quantity: string
  }[]
  fees: string
  deposit: string
  size: number
  invalid_before: string | null
  invalid_hereafter: string | null
  utxo_count: number
  withdrawal_count: number
  mir_cert_count: number
  delegation_count: number
  stake_cert_count: number
  pool_update_count: number
  pool_retire_count: number
  asset_mint_or_burn_count: number
  redeemer_count: number
  valid_contract: boolean
}

export type Block = {
  time: number
  height: number
  hash: string
  slot: number
  epoch: number
  epoch_slot: number
  slot_leader: string
  size: number
  tx_count: number
  output: string
  fees: string
  block_vrf: string
  op_cert: string
  op_cert_counter: string
  previous_block: string | null
  next_block: string | null
  confirmations: number
}

export type AddressKey = {
  paymentKeyHash: string
  stakeKeyHash: string
}

export type OrderUTxOWithDatumAndBlock = {
  orderDatum: {
    address: {
      paymentKeyHash: [string]
      stakeKeyHash: [[[string]]]
    }
    actionFields:
      | {
          MintDJED: {
            djedAmount: bigint
            adaAmount: bigint
          }
        }
      | {
          BurnDJED: {
            djedAmount: bigint
          }
        }
      | {
          MintSHEN: {
            shenAmount: bigint
            adaAmount: bigint
          }
        }
      | {
          BurnSHEN: {
            shenAmount: bigint
          }
        }
    adaUSDExchangeRate: {
      numerator: bigint
      denominator: bigint
    }
    creationDate: bigint
    orderStateTokenMintingPolicyId: string
  }
  block_hash: string
  block_slot: number
  tx_hash: string
  address: string
  amount: Amount[]
  collateral: boolean
  data_hash: string | null
  inline_datum: string | null
  output_index: number
  reference_script_hash: string | null
  consumed_by_tx: string | null
}

export enum OrderStatus {
  Created = "Created",
  Completed = "Completed",
  Cancelled = "Canceled",
}

export enum RedeemerPurpose {
  Spend = "spend",
  Mint = "mint",
  Cert = "cert",
  Reward = "reward",
}

export type TransactionRedeemer = {
  tx_index: number
  purpose: RedeemerPurpose
  script_hash: string
  redeemer_data_hash: string
  unit_mem: string
  unit_steps: string
  fee: string
}

export type PoolUTxoWithDatumAndTimestamp = {
  poolDatum: PoolDatum
  timestamp: string
  block_hash: string
  block_slot: number
}

export type OracleUTxoWithDatumAndTimestamp = {
  oracleDatum: OracleDatum
  timestamp: string
  block_hash: string
  block_slot: number
}

export type OrderedPoolOracleTxOs =
  | {
      key: "pool"
      value: PoolUTxoWithDatumAndTimestamp
    }
  | {
      key: "oracle"
      value: OracleUTxoWithDatumAndTimestamp
    }

export type ReserveRatio = {
  timestamp: string
  reserveRatio: number
  block: string
  slot: number
}

export type DjedMarketCap = {
  timestamp: string
  usdValue: bigint
  adaValue: bigint
  block: string
  slot: number
  token: "DJED"
}

export type DailyUTxOs = {
  day: string
  startIso: string
  endIso: string
  entries: OrderedPoolOracleTxOs[]
}

//TODO: to be deleted after confirm datum logic
export type WeightedReserveEntry = OrderedPoolOracleTxOs & {
  weight: number
  ratio?: number
  period?: {
    start: string
    end: string
  }
  usedPoolDatum?: PoolUTxoWithDatumAndTimestamp["poolDatum"]
  usedOracleDatum?: OracleUTxoWithDatumAndTimestamp["oracleDatum"]
}

export type DailyReserveRatioUTxOsWithWeights = Omit<DailyUTxOs, "entries"> & {
  entries: WeightedReserveEntry[]
}

export type WeightedDjedMarketCapEntry = OrderedPoolOracleTxOs & {
  weight: number
  usdValue?: bigint
  adaValue?: bigint
  period?: {
    start: string
    end: string
  }
  usedPoolDatum?: PoolUTxoWithDatumAndTimestamp["poolDatum"]
  usedOracleDatum?: OracleUTxoWithDatumAndTimestamp["oracleDatum"]
}

export type DailyDjedMarketCapUTxOsWithWeights = Omit<DailyUTxOs, "entries"> & {
  entries: WeightedDjedMarketCapEntry[]
}
