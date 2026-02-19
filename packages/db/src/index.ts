import { Blockfrost } from "@open-djed/blockfrost"
import { env } from "../lib/env"

export * from "./client/orders"
export * from "./client/reserveRatio"
export * from "./client/marketCap"
export * from "./client/price"
export * from "./sync/types"

export const blockfrost = new Blockfrost(env.BLOCKFROST_URL, env.BLOCKFROST_PROJECT_ID)
