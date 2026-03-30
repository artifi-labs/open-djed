import type { Value } from "@/types"
import type { TokenType } from "@open-djed/api"
import {
  adaDJEDRate,
  adaSHENRate,
  djedADARate,
  type PartialOracleDatum,
  type PartialPoolDatum,
  shenADARate,
} from "@open-djed/math"

export const valueToDJED = (
  value: Value,
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): number =>
  adaDJEDRate(oracleDatum)
    .mul(
      shenADARate(poolDatum, oracleDatum)
        .mul(BigInt(Math.floor((value.SHEN ?? 0) * 1e6)))
        .add(BigInt(Math.floor((value.ADA ?? 0) * 1e6))),
    )
    .div(1_000_000n)
    .toNumber() + (value.DJED ?? 0)

export const valueToADA = (
  value: Value,
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): number =>
  shenADARate(poolDatum, oracleDatum)
    .mul(BigInt(Math.floor((value.SHEN ?? 0) * 1e6)))
    .add(
      djedADARate(oracleDatum).mul(BigInt(Math.floor((value.DJED ?? 0) * 1e6))),
    )
    .div(1_000_000n)
    .toNumber() + (value.ADA ?? 0)

export const valueToSHEN = (
  value: Value,
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): number =>
  adaSHENRate(poolDatum, oracleDatum)
    .mul(
      djedADARate(oracleDatum)
        .mul(BigInt(Math.floor((value.DJED ?? 0) * 1e6)))
        .add(BigInt(Math.floor(value.ADA ?? 0) * 1e6)),
    )
    .div(1_000_000n)
    .toNumber() + (value.SHEN ?? 0)

export const valueTo = (
  value: Value,
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
  token: TokenType | "ADA",
): number =>
  token === "DJED"
    ? valueToDJED(value, poolDatum, oracleDatum)
    : token === "SHEN"
      ? valueToSHEN(value, poolDatum, oracleDatum)
      : valueToADA(value, poolDatum, oracleDatum)
