import { z } from "zod"
import type { RequestOrderOptions } from "../types"

const AddressTransactionSchema = z.object({
  tx_hash: z.string(),
  tx_index: z.number(),
  block_height: z.number(),
  block_time: z.number(),
})

export const AddressTransactionsSchema = z.array(AddressTransactionSchema)

export type AddressTransaction = z.infer<typeof AddressTransactionSchema>
export type AddressTransactionsResponse = z.infer<typeof AddressTransactionsSchema>

export type GetAddressTransactionsParams = {
  address: string
} & RequestOrderOptions