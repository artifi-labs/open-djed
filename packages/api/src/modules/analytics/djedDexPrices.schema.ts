import { z } from "zod"

/**
 * Schemas for DjedDexPrices API response.
 */
export const DjedDexPricesEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  token: z.literal("DJED"),
  usdValue: z.string(),
  adaValue: z.string(),
  minswapUsdValue: z.string().nullable(),
  minswapAdaValue: z.string().nullable(),
  wingridersAdaValue: z.string().nullable(),
  wingridersUsdValue: z.string().nullable(),
})

export const DjedDexPricesResponseApiSchema = z.array(
  DjedDexPricesEntryApiSchema,
)
export type DjedDexPricesEntryApi = z.infer<typeof DjedDexPricesEntryApiSchema>
export type DjedDexPricesResponseApi = z.infer<
  typeof DjedDexPricesResponseApiSchema
>

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const DjedDexPricesEntrySchema = DjedDexPricesEntryApiSchema.transform(
  (entry) => ({
    ...entry,
    usdValue: Number(entry.usdValue),
    adaValue: Number(entry.adaValue),
    minswapUsdValue: Number(entry.minswapUsdValue) || null,
    minswapAdaValue: Number(entry.minswapAdaValue) || null,
    wingridersAdaValue: Number(entry.wingridersAdaValue) || null,
    wingridersUsdValue: Number(entry.wingridersUsdValue) || null,
  }),
)

export const DjedDexPricesResponseSchema = z.array(DjedDexPricesEntrySchema)
export type DjedDexPricesEntry = z.infer<typeof DjedDexPricesEntrySchema>
export type DjedDexPricesResponse = z.infer<typeof DjedDexPricesResponseSchema>
