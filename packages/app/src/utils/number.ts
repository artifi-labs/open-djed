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

/**
 * Formats a percent value as an absolute percentage string.
 *
 * @param val - The percent value to format
 * @returns The formatted percent string (e.g. "12.34%")
 */
export const formatPercent = (val: number) =>
  `${formatNumber(Math.abs(val), { maximumFractionDigits: 2 })}%`

export const formatAxisValue = (val: number) => {
  if (val === 0) return val
  const abs = Math.abs(val)
  if (abs < 1) return val.toFixed(3)
  if (abs < 1_000) return Math.round(val).toString()
  if (abs < 1_000_000) return `${(val / 1_000).toFixed(1)}k`
  if (abs < 1_000_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  return `${(val / 1_000_000_000).toFixed(1)}B`
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
