import { MarketCapEntryApiSchema } from "@open-djed/api"
import z from "zod"

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
