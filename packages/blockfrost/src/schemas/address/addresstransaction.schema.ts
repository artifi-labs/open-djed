import { z } from "zod"
import { PaginationSchema } from "../pagination.schema"

const addressTransactionSchema = z.object({
  tx_hash: z.string(),
  tx_index: z.number(),
  block_height: z.number(),
  block_time: z.number(),
})

export const addressTransactionsResponseSchema = z.array(
  addressTransactionSchema,
)

export const addressTransactionsQuerySchema = PaginationSchema

export const addressTransactionsParamsSchema = z.object({
  address: z.string(),
})

export type AddressTransaction = z.infer<typeof addressTransactionSchema>
export type AddressTransactionsResponse = z.infer<
  typeof addressTransactionsResponseSchema
>
export type AddressTransactionsQuery = z.infer<
  typeof addressTransactionsQuerySchema
>
export type AddressTransactionsParams = z.infer<
  typeof addressTransactionsParamsSchema
>
