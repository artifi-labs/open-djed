import { z } from "zod"
import { DjedDexPricesEntryApiSchema } from "@open-djed/api"

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
