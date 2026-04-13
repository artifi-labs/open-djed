import { z } from "@hono/zod-openapi"
import {
  actionSchema,
  paginatedResponseSchema,
  paginationQueryParamsSchema,
} from "../../shared"

export const orderStatusSchema = z
  .enum(["Created", "Completed", "Rejected", "Canceled"])
  .openapi({ example: "Created" })

export type OrderStatus = z.infer<typeof orderStatusSchema>

/**
 * Schemas for Orders API response.
 */
export const orderApiSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    address: z.object({
      paymentKeyHash: z.array(z.string()),
      stakeKeyHash: z.array(z.any()),
    }),
    tx_hash: z.string().openapi({
      example:
        "5fe2b28e9d73acf76c5ebec3841f8e1e18a1a7da135bb9db8f93d198a0409e91",
    }),
    out_index: z.number().openapi({ example: 0 }),
    block: z.string().openapi({
      example:
        "7a6c295c3ef0a0a35f215932fc684b640602cc3846d3328fd9d062d64bce9171",
    }),
    slot: z.string().openapi({ example: "128853646" }),
    action: actionSchema,
    token: z.enum(["DJED", "SHEN", "BOTH"]).openapi({ example: "DJED" }),
    paid: z.string().nullable().openapi({ example: "21587601" }),
    fees: z.string().nullable().openapi({ example: "100000" }),
    received: z.string().nullable().openapi({ example: "21587601" }),
    orderDate: z.string().openapi({ example: "2026-02-26T14:50:00.000Z" }),
    status: orderStatusSchema,
  })
  .openapi({
    example: {
      id: 1,
      address: {
        paymentKeyHash: ["2f8f6e3a..."],
        stakeKeyHash: [[["2dbf9f1c..."]]],
      },
      tx_hash:
        "5fe2b28e9d73acf76c5ebec3841f8e1e18a1a7da135bb9db8f93d198a0409e91",
      out_index: 0,
      block: "7a6c295c3ef0a0a35f215932fc684b640602cc3846d3328fd9d062d64bce9171",
      slot: "128853646",
      action: "Mint",
      token: "DJED",
      paid: "21587601",
      fees: "100000",
      received: "21587601",
      orderDate: "2026-02-26T14:50:00.000Z",
      status: "Created",
    },
  })

export const ordersResponseApiSchema = paginatedResponseSchema(orderApiSchema)
export type OrdersApiResponse = z.infer<typeof ordersResponseApiSchema>
export type OrderApi = z.infer<typeof orderApiSchema>

// Query Params
export const ordersQueryParamsSchema = paginationQueryParamsSchema.extend({
  status: z
    .union([orderStatusSchema, z.array(orderStatusSchema)])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
})
export type OrdersQueryParams = z.infer<typeof ordersQueryParamsSchema>

// Body
export const ordersBodySchema = z.object({
  usedAddresses: z.array(z.string()).openapi({
    example: ["addr1q9a5v5k5j5k5j5k5j5k5j5k5j5k5j5k5j5k5j5k5j5k5j5k5j5k"],
  }),
})
export type OrdersBody = z.infer<typeof ordersBodySchema>
