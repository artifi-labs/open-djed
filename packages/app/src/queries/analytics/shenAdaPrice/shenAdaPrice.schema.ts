import { z } from "zod"
/**
 * Schemas for ShenAdaPrice API response.
 */
export const ShenAdaPriceEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  usdValue: z.string(),
  adaValue: z.string(),
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

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const ShenAdaPriceEntrySchema = ShenAdaPriceEntryApiSchema.transform(
  (entry) => ({
    ...entry,
    usdValue: Number(entry.usdValue),
    adaValue: Number(entry.adaValue),
  }),
)

export const ShenAdaPriceResponseSchema = z.object({
  ADA: z.array(ShenAdaPriceEntrySchema),
  SHEN: z.array(ShenAdaPriceEntrySchema),
})

export type ShenAdaPriceEntry = z.infer<typeof ShenAdaPriceEntrySchema>
export type ShenAdaPriceResponse = z.infer<typeof ShenAdaPriceResponseSchema>
