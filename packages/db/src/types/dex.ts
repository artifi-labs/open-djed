import type { DexKey } from "../dex.config"

export type Dex = "minswap" | "wingriders"

export type DexPriceEntry = {
  dex: string
  djedAda: number
}

export type DexDailyPrices = {
  day: Date
  prices: DexPriceEntry[]
}


export type DexDjedAdaPriceFields = {
  [K in DexKey as `${K}DjedAdaPrice`]: number
}
