import { z } from "zod"

export const ShenAdaPriceEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  usdValue: z.number(),
  adaValue: z.number(),
  token: z.enum(["ADA", "SHEN"]),
})

export const ShenAdaPriceResponseSchema = z.object({
  ADA: z.array(ShenAdaPriceEntrySchema),
  SHEN: z.array(ShenAdaPriceEntrySchema),
})

export type ShenAdaPriceEntry = z.infer<typeof ShenAdaPriceEntrySchema>
export type ShenAdaPriceResponse = z.infer<typeof ShenAdaPriceResponseSchema>
