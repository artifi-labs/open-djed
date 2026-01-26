import { describe, it, expect } from "vitest"
import {
  formatLiveStringToNumber,
  formatNumber,
  sanitizeNumberInput,
} from "../utils"

describe("formatNumber", () => {
  it("formats integers with default fraction digits", () => {
    expect(formatNumber(1234)).toBe("1,234.00")
    expect(formatNumber(0)).toBe("0.00")
    expect(formatNumber(1000000)).toBe("1,000,000.00")
  })

  it("formats decimals with default fraction digits", () => {
    expect(formatNumber(1234.5)).toBe("1,234.50")
    expect(formatNumber(1234.56789)).toBe("1,234.56789")
  })

  it("respects maximumFractionDigits", () => {
    expect(formatNumber(1234.56789, { maximumFractionDigits: 2 })).toBe(
      "1,234.57",
    )
    expect(formatNumber(1234.561, { maximumFractionDigits: 2 })).toBe(
      "1,234.56",
    )
  })

  it("respects minimumFractionDigits", () => {
    expect(formatNumber(1234, { minimumFractionDigits: 4 })).toBe("1,234.0000")
    expect(formatNumber(0.5, { minimumFractionDigits: 3 })).toBe("0.500")
  })

  it("works with both min and max fraction digits", () => {
    expect(
      formatNumber(1234.5, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 4,
      }),
    ).toBe("1,234.500")
    expect(
      formatNumber(1234.56789, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }),
    ).toBe("1,234.5679")
  })
})

describe("sanitizeNumberInput", () => {
  describe("commas", () => {
    it.each([
      ["1,234", "1234"],
      ["1,234,567", "1234567"],
    ])("removes commas from %s", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })

  describe("invalid characters", () => {
    it.each([
      ["abc", ""],
      ["a1b2c3", "123"],
      ["$12.34", "12.34"],
      ["€9.99", "9.99"],
    ])("removes invalid chars from %s", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })

  describe("decimal points", () => {
    it.each([
      ["1.2.3", "1.23"],
      ["10.5.7", "10.57"],
      ["..1", "0.1"],
    ])("allows only one dot in %s", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })

  describe("leading dot", () => {
    it.each([
      [".5", "0.5"],
      [".0", "0.0"],
    ])("prepends zero for %s", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })

  describe("valid input", () => {
    it.each([
      ["123", "123"],
      ["123.45", "123.45"],
    ])("returns %s unchanged", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })

  describe("edge cases", () => {
    it.each([
      ["", ""],
      ["....", "0."],
    ])("handles %s", (input, expected) => {
      expect(sanitizeNumberInput(input)).toBe(expected)
    })
  })
})

describe("formatStringToNumber", () => {
  it.each([
    ["", undefined, ""],
    ["0", undefined, "0"],
    ["1234", undefined, "1,234"],
    ["1234.5", undefined, "1,234.5"],
    ["1234.5678", undefined, "1,234.5678"],
    ["1234.5678", 2, "1,234.56"],
    ["0.", undefined, "0."],
    ["00123.45", undefined, "123.45"],
    ["1000.", undefined, "1,000."],
    ["0.123456", 4, "0.1234"],
  ])(
    "formats '%s' with maxDecimalPlaces=%s as '%s'",
    (input, maxDecimals, expected) => {
      expect(
        formatLiveStringToNumber(input, maxDecimals as number | undefined),
      ).toBe(expected)
    },
  )
})
