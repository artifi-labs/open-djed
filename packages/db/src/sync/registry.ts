import type { InterfaceHistoryScript } from "../types/history";
import { TokenPriceHistory } from "./analytics/price/DexPriceHistory";

export const historyScriptRegistry: InterfaceHistoryScript[] = [
  new TokenPriceHistory(),
]