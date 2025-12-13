import type { TokenType } from "@open-djed/api"
import {
  adaDJEDRate,
  adaSHENRate,
  djedADARate,
  shenADARate,
  type PartialOracleDatum,
  type PartialPoolDatum,
} from "@open-djed/math"

export function formatNumber(
  value: number,
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 6,
  }).format(value)
}

export const DEFAULT_SHOW_BALANCE = true

const VALUE_KEYS = ["ADA", "DJED", "SHEN"]

export const formatValue = (value: Value) => {
  const filteredValue = Object.entries(value).filter(([, v]) => v && v > 0)
  if (filteredValue.length === 0) return `0 ADA`
  return filteredValue
    .sort((a, b) => VALUE_KEYS.indexOf(a[0]) - VALUE_KEYS.indexOf(b[0]))
    .map(([k, v]) => `${formatNumber(v, { maximumFractionDigits: 4 })} ${k}`)
    .join(" ")
}

export type ADAValue = {
  ADA: number
}

export type Value = Partial<Record<"ADA" | TokenType, number>>

export const sumValues = (...values: Value[]): Value =>
  values.reduce(
    (acc, value) => ({
      ...acc,
      ...Object.fromEntries(
        Object.entries(value).map(([k, v]) => [
          k,
          v + (acc[k as keyof Value] ?? 0),
        ]),
      ),
    }),
    {},
  )

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
