import TTLCache from "@isaacs/ttlcache"
import { Blockfrost } from "@open-djed/blockfrost"
import { env } from "../lib/env"
import { registryByNetwork } from "@open-djed/registry"
import { Lucid, type LucidEvolution } from "@lucid-evolution/lucid"

export * from "./chain"

export const network = env.NETWORK

export const registry = registryByNetwork[network]

export const chainDataCache = new TTLCache({ ttl: 10_000, checkAgeOnGet: true })

export const blockfrost = new Blockfrost(
  env.BLOCKFROST_URL,
  env.BLOCKFROST_PROJECT_ID,
)

export const getLucid = async () => {
  const cached = chainDataCache.get<LucidEvolution>("")
  if (cached) return cached
  const lucid = await Lucid(blockfrost, network)
  chainDataCache.set("lucid", lucid, { ttl: 600_000 })
  return lucid
}
