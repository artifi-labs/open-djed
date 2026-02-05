export const formatSmall = (val: number) => {
  const rounded = val.toFixed(3)
  return rounded.replace(/\.?0+$/, "")
}

// TODO: TEST DECIMALS
export const formatAxisValue = (val: number) => {
  const sign = val < 0 ? "-" : ""
  const absVal = Math.abs(val)

  if (absVal === 0) return "0"
  if (absVal < 1) return `${sign}${formatSmall(absVal)}`

  const ranges = [
    { limit: 1e3, divisor: 1, decimals: 0, suffix: "" },
    { limit: 1e4, divisor: 1e3, decimals: 1, suffix: "k" },
    { limit: 1e6, divisor: 1e3, decimals: 0, suffix: "k" },
    { limit: 1e7, divisor: 1e6, decimals: 1, suffix: "M" },
    { limit: 1e9, divisor: 1e6, decimals: 0, suffix: "M" },
    { limit: 1e10, divisor: 1e9, decimals: 1, suffix: "B" },
    { limit: Infinity, divisor: 1e9, decimals: 0, suffix: "B" },
  ]

  for (const { limit, divisor, decimals, suffix } of ranges) {
    if (absVal < limit) {
      const scaled = absVal / divisor
      const formatted =
        decimals > 0 ? scaled.toFixed(decimals) : Math.round(scaled).toString()
      return `${sign}${formatted}${suffix}`
    }
  }

  return `${sign}${Math.round(absVal)}`
}

// format y-axis ticks as USD
export const yTickFormatter = (value: number | string) =>
  `$${formatAxisValue(Number(value))}`

export const dateFormatter = (label: string | number) => {
  if (!label) return ""
  const d = new Date(label)
  if (Number.isNaN(d.getTime())) return String(label)

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
