import { z } from "zod"

export const marketCapEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  marketCap: z.number(),
  adaValue: z.number(),
  usdValue: z.number(),
})

export const marketCapResponseSchema = z.array(marketCapEntrySchema)
