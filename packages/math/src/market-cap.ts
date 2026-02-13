import type { PoolDatum } from "@open-djed/data"
import { Rational } from "./rational"
import {
  djedADARate,
  shenADARate,
  shenUSDRate,
  type PartialOracleDatum,
  type PartialPoolDatum,
} from "./rate"

export const djedInCirculation = ({
  djedInCirculation,
}: Pick<PoolDatum, "djedInCirculation">): Rational =>
  new Rational(djedInCirculation)

export const djedUSDMarketCap = (poolDatum: PartialPoolDatum): Rational =>
  djedInCirculation(poolDatum)

export const djedADAMarketCap = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): Rational => djedInCirculation(poolDatum).mul(djedADARate(oracleDatum))

export const shenInCirculation = ({
  shenInCirculation,
}: Pick<PoolDatum, "shenInCirculation">): Rational =>
  new Rational(shenInCirculation)

export const shenUSDMarketCap = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): Rational =>
  shenInCirculation(poolDatum).mul(shenUSDRate(poolDatum, oracleDatum))

export const shenADAMarketCap = (
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
): Rational =>
  shenInCirculation(poolDatum).mul(shenADARate(poolDatum, oracleDatum))
