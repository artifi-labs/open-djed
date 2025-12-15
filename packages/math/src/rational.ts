import { absBigInt } from "./bigint"

export type RationalFields = {
  numerator: bigint
  denominator: bigint
}

export const mul = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.numerator,
  denominator: a.denominator * b.denominator,
})

export const div = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.denominator,
  denominator: a.denominator * b.numerator,
})

export const add = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.denominator + b.numerator * a.denominator,
  denominator: a.denominator * b.denominator,
})

export const negate = ({
  numerator,
  denominator,
}: RationalFields): RationalFields => ({
  numerator: -numerator,
  denominator,
})

export const sub = (a: RationalFields, b: RationalFields): RationalFields =>
  add(a, negate(b))

export const fromBigInt = (n: bigint): RationalFields => ({
  numerator: n,
  denominator: 1n,
})

export const ceil = (r: RationalFields): RationalFields => {
  const quotient = r.numerator / r.denominator
  const remainder = r.numerator % r.denominator
  return new Rational({
    numerator: quotient + (remainder > 0n ? 1n : 0n),
    denominator: 1n,
  })
}

export const toBigInt = (r: RationalFields): bigint =>
  r.numerator / r.denominator

const gcd = (a: bigint, b: bigint): bigint => {
  a = absBigInt(a)
  b = absBigInt(b)

  while (b !== 0n) {
    const temp = b
    b = a % b
    a = temp
  }

  return a
}

export const simplify = (r: RationalFields): RationalFields => {
  const cf = gcd(r.numerator, r.denominator)
  return {
    numerator: r.numerator / cf,
    denominator: r.denominator / cf,
  }
}

export const toNumber = (r: RationalFields): number => {
  const simplifiedR = simplify(r)
  return Number(simplifiedR.numerator) / Number(simplifiedR.denominator)
}

export const invert = (r: RationalFields): RationalFields => ({
  numerator: r.denominator,
  denominator: r.numerator,
})

export class Rational implements RationalFields {
  readonly numerator: bigint
  readonly denominator: bigint

  static ZERO = new Rational(0n)
  static ONE = new Rational(1n)

  constructor(r: RationalFields | bigint) {
    if (typeof r === "bigint") {
      this.numerator = r
      this.denominator = 1n
      return
    }
    this.numerator = r.numerator
    this.denominator = r.denominator
  }
  mul(b: RationalFields | bigint): Rational {
    return new Rational(mul(this, typeof b === "bigint" ? fromBigInt(b) : b))
  }
  div(b: RationalFields | bigint): Rational {
    return new Rational(div(this, typeof b === "bigint" ? fromBigInt(b) : b))
  }
  add(b: RationalFields | bigint): Rational {
    return new Rational(add(this, typeof b === "bigint" ? fromBigInt(b) : b))
  }
  sub(b: RationalFields | bigint): Rational {
    return new Rational(sub(this, typeof b === "bigint" ? fromBigInt(b) : b))
  }
  ceil(): Rational {
    return new Rational(ceil(this))
  }
  toBigInt(): bigint {
    return toBigInt(this)
  }
  simplify(): Rational {
    return new Rational(simplify(this))
  }
  toNumber(): number {
    return toNumber(this)
  }
  invert(): Rational {
    return new Rational(invert(this))
  }
  negate(): Rational {
    return new Rational(negate(this))
  }
}
