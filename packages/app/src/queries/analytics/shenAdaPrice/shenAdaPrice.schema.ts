import { ShenAdaPriceEntryApiSchema } from "@open-djed/api"
import z from "zod"

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
