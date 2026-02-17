import type { ApiQueryParams } from "../types"

export type AddressTransactionQueryParams = ApiQueryParams

export type AddressTransactionsParams = {
  address: string
}

export type AddressTransaction = {
  tx_hash: string
  tx_index: number
  block_height: number
  block_time: number
}

export type AddressTransactionsResponse = AddressTransaction[]