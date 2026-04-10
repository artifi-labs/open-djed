import { z } from "zod"
import {
  actionSchema,
  paginatedResponseSchema,
  paginationQueryParamsSchema,
} from "../../shared"

export const orderStatusSchema = z.enum([
  "Created",
  "Completed",
  "Rejected",
  "Canceled",
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

/**
 * Schemas for Orders API response.
 */
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
export type OrdersApiResponse = z.infer<typeof ordersResponseApiSchema>
export type OrderApi = z.infer<typeof orderApiSchema>

// Query Params
export const ordersQueryParamsSchema = paginationQueryParamsSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z
    .union([orderStatusSchema, z.array(orderStatusSchema)])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
})
export type OrdersQueryParams = z.infer<typeof ordersQueryParamsSchema>

// Body
export const ordersBodySchema = z.object({
  usedAddresses: z.array(z.string()),
})
export type OrdersBody = z.infer<typeof ordersBodySchema>
