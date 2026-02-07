import type { PoolDatum } from "@open-djed/data"
import { Rational, type RationalFields } from "./rational"

export type PartialOracleDatum = {
  oracleFields: { adaUSDExchangeRate: RationalFields }
}

export type PartialPoolDatum = Pick<
  PoolDatum,
  "adaInReserve" | "djedInCirculation" | "shenInCirculation"
>

export const shenUSDRate = (
  pool: PartialPoolDatum,
  oracle: PartialOracleDatum,
): Rational =>
  shenADARate(pool, oracle).mul(oracle.oracleFields.adaUSDExchangeRate)

export const shenADARate = (
  { adaInReserve, djedInCirculation, shenInCirculation }: PartialPoolDatum,
  { oracleFields: { adaUSDExchangeRate } }: PartialOracleDatum,
): Rational =>
  new Rational(adaInReserve)
    .sub(new Rational(adaUSDExchangeRate).invert().mul(djedInCirculation))
    .div(shenInCirculation)

export const adaSHENRate = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): Rational => shenADARate(poolDatum, oracleDatum).invert()

export const shenADAMintRate = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
  shenMintFee: RationalFields,
): Rational =>
  shenADARate(poolDatum, oracleDatum).mul(new Rational(1n).add(shenMintFee))

export const shenADABurnRate = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
  shenBurnRate: RationalFields,
): Rational =>
  shenADARate(poolDatum, oracleDatum).mul(new Rational(1n).sub(shenBurnRate))

export const adaDJEDRate = ({
  oracleFields: { adaUSDExchangeRate },
}: PartialOracleDatum): Rational => new Rational(adaUSDExchangeRate)

export const djedADARate = (oracleDatum: PartialOracleDatum): Rational =>
  adaDJEDRate(oracleDatum).invert()

export const djedADAMintRate = (
  oracleDatum: PartialOracleDatum,
  djedMintFee: RationalFields,
): Rational => djedADARate(oracleDatum).mul(new Rational(1n).add(djedMintFee))

export const djedADABurnRate = (
  oracleDatum: PartialOracleDatum,
  djedBurnFee: RationalFields,
): Rational => djedADARate(oracleDatum).mul(new Rational(1n).sub(djedBurnFee))

export const toAdaUsdExchangeRate = (adaUsd: number): RationalFields => ({
  numerator: BigInt(Math.round(adaUsd * 1_000_000)),
  denominator: 1_000_000n,
})
