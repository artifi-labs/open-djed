import type { AnyDexAdapter } from "./adapter";
import { minswapAdapter } from "./minswapAdapter";

export const adapters = {
  minswap: minswapAdapter,
} satisfies Record<string, AnyDexAdapter>
