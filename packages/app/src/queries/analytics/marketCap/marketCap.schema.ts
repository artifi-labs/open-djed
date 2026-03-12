import { z } from "zod"

export const MarketCapEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  marketCap: z.number(),
  adaValue: z.number(),
  usdValue: z.number(),
})

export const MarketCapResponseSchema = z.array(MarketCapEntrySchema)
export type MarketCapEntry = z.infer<typeof MarketCapEntrySchema>
export type MarketCapResponse = z.infer<typeof MarketCapResponseSchema>
