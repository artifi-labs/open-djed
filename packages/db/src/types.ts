import type { OrderDatum } from '@open-djed/data'
import type { Actions, Token } from '../generated/prisma/enums'

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
  consumed_by_tx?: string
}

export type OrderUTxO = Output & { tx_hash: string }

export type OrderUTxOWithDatum = Output & {
  tx_hash: string
  orderDatum: OrderDatum
  block_hash: string
}

export type Order = {
  address: string
  tx_hash: string
  block: string
  action: Actions
  token: Token
  paid: bigint
  fees: bigint
  received: bigint
  orderDate: Date
  status: string
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
