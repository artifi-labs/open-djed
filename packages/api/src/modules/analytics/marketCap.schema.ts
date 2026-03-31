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

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const MarketCapEntrySchema = MarketCapEntryApiSchema.transform(
  (entry) => ({
    ...entry,
    adaValue: Number(entry.adaValue),
    usdValue: Number(entry.usdValue),
  }),
)

export const MarketCapResponseSchema = z.array(MarketCapEntrySchema)
export type MarketCapEntry = z.infer<typeof MarketCapEntrySchema>
export type MarketCapResponse = z.infer<typeof MarketCapResponseSchema>
