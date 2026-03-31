import { z } from "zod"

export type MarketCapValue = {
  ADA: bigint
  USD: bigint
}

/**
 * Schemas for MarketCap API response.
 */
export const MarketCapEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.coerce.string(),
  adaValue: z.coerce.string(),
  usdValue: z.coerce.string(),
})

export const MarketCapResponseApiSchema = z.array(MarketCapEntryApiSchema)
export type MarketCapEntryApi = z.infer<typeof MarketCapEntryApiSchema>
export type MarketCapResponseApi = z.infer<typeof MarketCapResponseApiSchema>
