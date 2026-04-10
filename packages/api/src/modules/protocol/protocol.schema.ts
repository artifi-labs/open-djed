import { z } from "zod"

/**
 * Schemas for Protocol API response.
 */
export const protocolDataApiSchema = z.object({
  oracleDatum: z.object({
    oracleFields: z.object({
      adaUSDExchangeRate: z.object({
        numerator: z.string(),
        denominator: z.string(),
      }),
    }),
  }),
  poolDatum: z.object({
    djedInCirculation: z.string(),
    shenInCirculation: z.string(),
    adaInReserve: z.string(),
    minADA: z.string(),
  }),
})

export const protocolDataResponseApiSchema = protocolDataApiSchema
export type ProtocolDataApiResponse = z.infer<typeof protocolDataResponseApiSchema>
export type ProtocolDataApi = z.infer<typeof protocolDataApiSchema>

// Query Params
export const ProtocolDataParamsSchema = {}
export type ProtocolDataQueryParams = z.infer<typeof ProtocolDataParamsSchema>
