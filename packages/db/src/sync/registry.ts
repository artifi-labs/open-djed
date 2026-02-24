import type { HistoryScript } from "./analytics/HistoryScript";
import { type DexProvider, MinswapProvider, WingridersProvider } from "./analytics/price/dexs/dexProvider";
import { TokenPriceHistory } from "./analytics/price/TokenPriceHistory";

export const historyScriptRegistry: HistoryScript[] = [
  new TokenPriceHistory(),
]
