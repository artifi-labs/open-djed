import {
  paginatedResponseSchema,
  paginationQueryParamsSchema,
} from "../pagination.schemas"
import { z } from "zod"

export const orderStatusSchema = z.enum([
  "Created",
  "Completed",
  "Rejected",
  "Canceled",
])

export const orderSchema = z.object({
  id: z.number(),
  address: z.any(),
  tx_hash: z.string(),
  out_index: z.number(),
  block: z.string(),
  slot: z.number(),
  action: z.enum(["Mint", "Burn"]), // TODO: change this
  token: z.enum(["DJED", "SHEN", "BOTH"]),
  paid: z.number().nullable(),
  fees: z.number().nullable(),
  received: z.number().nullable(),
  orderDate: z.iso.datetime(),
  status: orderStatusSchema,
})

export const ordersQueryParamsSchema = paginationQueryParamsSchema.extend({
  status: z.array(orderStatusSchema).optional(),
})

export const ordersBodySchema = z.object({
  usedAddresses: z.array(z.string()),
})

export const ordersResponseSchema = paginatedResponseSchema(orderSchema)
export type OrdersApiResponse = z.infer<typeof ordersResponseSchema>
export type OrdersQueryParams = z.infer<typeof ordersQueryParamsSchema>
export type OrdersBody = z.infer<typeof ordersBodySchema>

export type OrderStatus = z.infer<typeof orderStatusSchema>

export type Order = z.infer<typeof orderSchema>
