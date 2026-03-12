import { z } from "zod"

export const djedDexPricesEntrySchema = z.object({
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

export const djedDexPricesResponseSchema = z.array(djedDexPricesEntrySchema)
