import type { Token } from "../lib/tokens"
import type { ToUSDConverter, Value } from "@/types"
import { formatNumber } from "@/utils/number"
import { capitalize } from "@/utils/string"

/**
 * Formats an ADA value with up to 4 decimal places.
 *
 * @param val - The ADA value to format
 * @returns The formatted ADA string (e.g. "1.2345 ADA")
 */
export const formatADA = (val: number) =>
  `${formatNumber(val, { maximumFractionDigits: 4 })} ADA`

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

/**
 * Formats a value in ADA into a USD string using a conversion function.
 *
 * @param toUSD - Converter that formats a value at the given price
 * @param val - The ADA amount to convert
 * @param price - The ADA/USD price used for conversion
 * @param isReady - Whether conversion data is ready
 * @returns The formatted USD string, or "$0.00" if conversion is not ready
 */
export const formatUSDValue = (
  toUSD: ToUSDConverter | undefined,
  val: number,
  price: number,
  isReady: boolean,
): string => {
  if (!toUSD || !isReady) return "$0.00"
  return toUSD({ ADA: val }, price)
}

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

export const formatToken = (v: number, token: Token) =>
  `${v} ${capitalize(token)}`

export const formatUSD = (v: number) => `$${v}`
