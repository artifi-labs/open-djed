import { OracleDatum, PoolDatum } from "@open-djed/data"
import { DatumDecodeError, UTxOMissingError } from "../shared/errors"
import { blockfrost, chainDataCache, network, registry } from "."
import { Data, slotToUnixTime } from "@lucid-evolution/lucid"
import type { OracleUTxO, PoolUTxO } from "@open-djed/txs"

const getDatum = async (datumHash: string, errorMessage: string) => {
  try {
    return await blockfrost.getDatum(datumHash)
  } catch {
    throw new DatumDecodeError(errorMessage)
  }
}

export const getPoolUTxO = async () => {
  const cached = chainDataCache.get<PoolUTxO>("poolUTxO")
  if (cached) return cached
  const rawPoolUTxO = (
    await blockfrost.getUtxosWithUnit(
      registry.poolAddress,
      registry.poolAssetId,
    )
  )[0]
  if (!rawPoolUTxO) throw new UTxOMissingError("Failed to get a pool UTxO.")
  const rawDatum =
    rawPoolUTxO.datum ??
    (rawPoolUTxO.datumHash
      ? await getDatum(rawPoolUTxO.datumHash, "Failed to get a pool datum.")
      : undefined)
  if (!rawDatum) throw new DatumDecodeError("Failed to decode a pool datum.")
  const poolUTxO = {
    ...rawPoolUTxO,
    poolDatum: Data.from(rawDatum, PoolDatum),
  }
  chainDataCache.set("poolUTxO", poolUTxO)
  return poolUTxO
}

export const getOracleUTxO = async () => {
  const cached = chainDataCache.get<OracleUTxO>("oracleUTxO")
  if (cached) return cached
  const rawOracleUTxO = (
    await blockfrost.getUtxosWithUnit(
      registry.oracleAddress,
      registry.oracleAssetId,
    )
  )[0]
  if (!rawOracleUTxO) throw new UTxOMissingError("Failed to get a oracle UTxO.")
  const rawDatum =
    rawOracleUTxO.datum ??
    (rawOracleUTxO.datumHash
      ? await getDatum(
          rawOracleUTxO.datumHash,
          "Failed to get an oracle datum.",
        )
      : undefined)
  if (!rawDatum) throw new DatumDecodeError("Failed to decode a oracle datum.")
  const oracleUTxO = {
    ...rawOracleUTxO,
    oracleDatum: Data.from(rawDatum, OracleDatum),
  }
  chainDataCache.set("oracleUTxO", oracleUTxO)
  return oracleUTxO
}

export const getChainTime = async () => {
  const cached = chainDataCache.get<number>("now")
  if (cached) return cached
  const now = slotToUnixTime(network, await blockfrost.getLatestBlockSlot())
  chainDataCache.set("now", now)
  return now
}
