import { orderApiSchema, paginatedResponseSchema } from "@open-djed/api"
import type z from "zod"

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
export type OrdersResponse = z.infer<typeof ordersResponseSchema>

export type Order = z.infer<typeof orderSchema>
