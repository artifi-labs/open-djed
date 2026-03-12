import { z } from "zod"

export const DjedDexPricesEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  token: z.literal("DJED"),
  usdValue: z.number(),
  adaValue: z.number(),
  minswapUsdValue: z.number(),
  minswapAdaValue: z.number(),
  wingridersAdaValue: z.number(),
  wingridersUsdValue: z.number(),
})

export const DjedDexPricesResponseSchema = z.array(DjedDexPricesEntrySchema)

export type DjedDexPricesEntry = z.infer<typeof DjedDexPricesEntrySchema>
export type DjedDexPricesResponse = z.infer<typeof DjedDexPricesResponseSchema>
