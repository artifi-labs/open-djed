import { expect, test, describe } from "vitest"
import { Rational } from "./rational"

describe("Rational extreme cases", () => {
  test("toNumber should not return NaN for very large bigints", () => {
    // 10n ** 309n is larger than Number.MAX_VALUE (~1.8e308)
    const largeNumerator = 10n ** 400n + 1n
    const largeDenominator = 10n ** 400n + 2n
    const r = new Rational({
      numerator: largeNumerator,
      denominator: largeDenominator,
    })

    const result = r.toNumber()
    expect(result).not.toBeNaN()
    // It should be approximately 1
    expect(result).toBeGreaterThan(0.9)
    expect(result).toBeLessThan(1.1)
  })

  test("toNumber should handle cases where only numerator is very large", () => {
    const largeNumerator = 10n ** 400n
    const r = new Rational({ numerator: largeNumerator, denominator: 1n })
    expect(r.toNumber()).toBe(Infinity)
  })

  test("toNumber should handle cases where only denominator is very large", () => {
    const largeDenominator = 10n ** 400n
    const r = new Rational({ numerator: 1n, denominator: largeDenominator })
    expect(r.toNumber()).toBe(0)
  })
})
