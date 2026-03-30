import { z } from "zod"
import {
  actionSchema,
  paginatedResponseSchema,
  paginationQueryParamsSchema,
} from "../common"

export const orderStatusSchema = z.enum([
  "Created",
  "Completed",
  "Rejected",
  "Canceled",
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderApiSchema = z.object({
  id: z.number(),
  address: z.any(),
  tx_hash: z.string(),
  out_index: z.number(),
  block: z.string(),
  slot: z.string(),
  action: actionSchema,
  token: z.enum(["DJED", "SHEN", "BOTH"]),
  paid: z.string().nullable(),
  fees: z.string().nullable(),
  received: z.string().nullable(),
  orderDate: z.string(),
  status: orderStatusSchema,
})

export const ordersResponseApiSchema = paginatedResponseSchema(orderApiSchema)
export type OrdersApiResponse = z.infer<typeof ordersResponseSchema>
export type OrderApi = z.infer<typeof orderApiSchema>

// Query Params
export const ordersQueryParamsSchema = paginationQueryParamsSchema.extend({
  status: z.array(orderStatusSchema).optional(),
})
export type OrdersQueryParams = z.infer<typeof ordersQueryParamsSchema>

// Body
export const ordersBodySchema = z.object({
  usedAddresses: z.array(z.string()),
})
export type OrdersBody = z.infer<typeof ordersBodySchema>

/**
 * Transform the API schema to convert string fields to their appropriate types (e.g., BigInt, Date)
 */
export const orderSchema = orderApiSchema.transform((entry) => ({
  ...entry,
  slot: BigInt(entry.slot),
  paid: entry.paid !== null ? BigInt(entry.paid) : null,
  fees: entry.fees !== null ? BigInt(entry.fees) : null,
  received: entry.received !== null ? BigInt(entry.received) : null,
  orderDate: new Date(entry.orderDate),
}))

export const ordersResponseSchema = paginatedResponseSchema(orderSchema)
export type Order = z.infer<typeof orderSchema>
