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
