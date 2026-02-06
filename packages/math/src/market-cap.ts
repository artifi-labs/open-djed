import type { PoolDatum } from "@open-djed/data"
import { Rational } from "./rational"
import {
  djedADARate,
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
