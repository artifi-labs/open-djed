import type { Pool } from "../sync/analytics/price/dexs/dexTokenPrice"

export type DexDailyPrices = {
  day: Date
  poolEntries: Pool[]
}