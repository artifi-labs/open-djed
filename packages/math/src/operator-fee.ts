import { maxBigInt, minBigInt } from "./bigint"
import type { Rational, RationalFields } from "./rational"

export type OperatorFeeConfig = {
  min: bigint
  max: bigint
  percentage: Rational
}

export const operatorFee = (
  adaAmount: bigint | RationalFields,
  config: OperatorFeeConfig,
): bigint =>
  maxBigInt(
    config.min,
    minBigInt(config.percentage.mul(adaAmount).ceil().toBigInt(), config.max),
  )
