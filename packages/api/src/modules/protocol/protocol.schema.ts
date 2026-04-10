import { z } from '@hono/zod-openapi'

/**
 * Schemas for Protocol API response.
 */
export const protocolDataApiSchema = z.object({
  oracleDatum: z.object({
    oracleFields: z.object({
      adaUSDExchangeRate: z.object({
        numerator: z.string().openapi({example: "25483"}),
        denominator: z.string().openapi({example: "100000"}),
      }),
    }),
  }),
  poolDatum: z.object({
    djedInCirculation: z.string().openapi({example: "1190401366557"}),
    shenInCirculation: z.string().openapi({example: "2308335235022"}),
    adaInReserve: z.string().openapi({example: "8578390699497"}),
    minADA: z.string().openapi({example: "1823130"}),
  }),
})

export const protocolDataResponseApiSchema = protocolDataApiSchema
export type ProtocolDataApiResponse = z.infer<typeof protocolDataResponseApiSchema>
export type ProtocolDataApi = z.infer<typeof protocolDataApiSchema>

// Query Params
export const ProtocolDataParamsSchema = {}
export type ProtocolDataQueryParams = z.infer<typeof ProtocolDataParamsSchema>
