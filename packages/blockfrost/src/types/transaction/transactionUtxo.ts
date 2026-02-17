import type { ApiQueryParams } from "../types"

export type TransactionUtxoQueryParams = ApiQueryParams

export type TransactionUtxoParams = {
  hash: string
}

export type TransactionUtxoAmount = {
  unit: string
  quantity: string
}

export type TransactionBaseUtxoInput = {
  address: string
  amount: TransactionUtxoAmount[]
  output_index: number
  data_hash: string
  inline_datum: string
  reference_script_hash: string
  collateral: boolean
}

export type TransactionUtxoInput = TransactionBaseUtxoInput & {
  tx_hash: string
  reference: boolean
}

export type TransactionUtxoOutput = TransactionBaseUtxoInput & {
  consumed_by_tx: string
}

export type TransactionUtxo = {
  hash: string
  inputs: TransactionUtxoInput[]
  outputs: TransactionUtxoOutput[]
}

export type TransactionUtxoResponse = TransactionUtxo

