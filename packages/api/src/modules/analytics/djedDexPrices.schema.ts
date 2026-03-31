import { z } from "zod"

/**
 * Schemas for DjedDexPrices API response.
 */
export const DjedDexPricesEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.coerce.string(),
  token: z.literal("DJED"),
  usdValue: z.coerce.string(),
  adaValue: z.coerce.string(),
  minswapUsdValue: z.coerce.string().nullable(),
  minswapAdaValue: z.coerce.string().nullable(),
  wingridersAdaValue: z.coerce.string().nullable(),
  wingridersUsdValue: z.coerce.string().nullable(),
})

export const DjedDexPricesResponseApiSchema = z.array(
  DjedDexPricesEntryApiSchema,
)
export type DjedDexPricesApi = z.infer<typeof DjedDexPricesEntryApiSchema>
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
export type DjedDexPrices = z.infer<typeof DjedDexPricesEntrySchema>
export type DjedDexPricesResponse = z.infer<typeof DjedDexPricesResponseSchema>
