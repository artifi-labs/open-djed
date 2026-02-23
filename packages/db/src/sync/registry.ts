import type { HistoryScript } from "./analytics/HistoryScript";
import { TokenPriceHistory } from "./analytics/price/DexPriceHistory";

export const historyScriptRegistry: HistoryScript[] = [
  new TokenPriceHistory(),
]