import type { TokenType } from "@open-djed/api"
import {
  adaDJEDRate,
  adaSHENRate,
  djedADARate,
  shenADARate,
  type PartialOracleDatum,
  type PartialPoolDatum,
} from "@open-djed/math"
import type { Token } from "./tokens"

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

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalize = (str: string = ""): string => {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converts a string to lowercase and then capitalizes the first letter
 * @param str - The string to format
 * @returns The string with first letter capitalized and the rest in lowercase
 */
export const capitalizeLower = (str: string = ""): string => {
  if (!str) return ""
  const lower = str.toLowerCase()
  return capitalize(lower)
}

/**
 * Shortens a string by keeping the first `start` and last `end` characters,
 * and adding "..." in the middle if the string is longer than `start + end`.
 *
 * @param text - The string to shorten
 * @param start - Number of characters to keep at the start (default 6)
 * @param end - Number of characters to keep at the end (default 4)
 * @returns Shortened string
 *
 * Example:
 * shortenString("addr1q8xyz123tx3c") => "addr1q...tx3c"
 */
export const shortenString = (text: string, start = 4, end = 6): string => {
  if (text.length <= start + end) return text
  return `${text.slice(0, start)}...${text.slice(-end)}`
}

/**
 * Sanitizes numeric input for financial values.
 *
 * Rules:
 * - Converts commas (`,`) to dots (`.`)
 * - Allows only digits (`0–9`) and a single dot (`.`)
 * - Removes any extra dots after the first one
 * - Adds a leading zero if the value starts with a dot (e.g., ".5" becomes "0.5")
 *
 * @param {string} value - Raw input value from the user
 * @returns {string} A sanitized numeric string
 *
 * @example
 * sanitizeNumberInput("1,5")   // "1.5"
 * sanitizeNumberInput("1.2.3") // "1.23"
 * sanitizeNumberInput(",5")    // "0.5"
 * sanitizeNumberInput("1a,2b") // "1.2"
 * sanitizeNumberInput(".1231") // "0.1231"
 */
export const sanitizeNumberInput = (v: string) => {
  const sanitized = v
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1")

  if (sanitized.startsWith(".")) {
    return "0" + sanitized
  }

  return sanitized
}

export const formatToken = (v: number, token: Token) =>
  `${v} ${capitalize(token)}`

export const formatUSD = (v: number) => `$${v}`

/**
 * Checks if a value is considered "empty" for financial inputs.
 *
 * A value is considered empty if it is:
 * - null or undefined
 * - a string that is empty, contains only whitespace, or represents the number 0
 * - a number that is equal to 0
 *
 * @param val - The value to check
 * @returns True if the value is empty, false otherwise
 */
export const isEmptyValue = (val: unknown) => {
  if (val === null || val === undefined) return true
  if (typeof val === "string") {
    const t = val.trim()
    if (t === "") return true
    const n = Number(t)
    if (!Number.isNaN(n)) return n === 0
    return false
  }
  if (typeof val === "number") return val === 0
  return false
}

/** Rounds a number to a specified number of decimal places.
 *
 * @param value - The number to round
 * @param decimals - The number of decimal places to round to (default is 4)
 * @returns The rounded number
 */
export const roundToDecimals = (
  value: number,
  decimals: number = 4,
): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export const toISODate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}
