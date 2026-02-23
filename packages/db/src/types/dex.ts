import type { DEX_CONFIG } from "../dex.config"

export type Dex = "minswap" | "wingriders"

export type PoolLiquidity = {
  djedLiquidity: bigint
  adaLiquidity: bigint
}

export type DexPriceEntry = {
  dex: DexName
  djedAda: number
  djedUsd: number
  poolLiquidity?: PoolLiquidity
}

export type DexDailyPrices = {
  day: Date
  prices: DexPriceEntry[]
}

export type DexName = keyof typeof DEX_CONFIG

export type DexDjedAdaPriceFields = {
  [K in DexName as `${K}DjedAdaPrice`]: number
}
