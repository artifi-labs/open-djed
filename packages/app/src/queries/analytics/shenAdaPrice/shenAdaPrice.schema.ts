import { z } from "zod"

export const shenAdaPriceEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  usdValue: z.number(),
  adaValue: z.number(),
  token: z.enum(["ADA", "SHEN"]),
})

export const shenAdaPriceResponseSchema = z.object({
  ADA: z.array(shenAdaPriceEntrySchema),
  SHEN: z.array(shenAdaPriceEntrySchema),
})
