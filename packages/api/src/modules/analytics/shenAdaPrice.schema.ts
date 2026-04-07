import { z } from "zod"

/**
 * Schemas for ShenAdaPrice API response.
 */
export const ShenAdaPriceEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.coerce.string(),
  usdValue: z.coerce.string(),
  adaValue: z.coerce.string(),
  token: z.enum(["ADA", "SHEN"]),
})

export const ShenAdaPriceResponseApiSchema = z.object({
  ADA: z.array(ShenAdaPriceEntryApiSchema),
  SHEN: z.array(ShenAdaPriceEntryApiSchema),
})

export type ShenAdaPriceEntryApi = z.infer<typeof ShenAdaPriceEntryApiSchema>
export type ShenAdaPriceResponseApi = z.infer<
  typeof ShenAdaPriceResponseApiSchema
>
