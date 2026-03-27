import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { type Currency } from "../useAnalyticsData"
import { env } from "@/lib/envLoader"
import { type DjedDexPricesResponse } from "@open-djed/api"

type DjedDexPriceChartProps = {
  data: DjedDexPricesResponse
  currency: Currency
}

const getMaxMin = (data: DjedDexPricesResponse, isUsd: boolean) => {
  const keys = isUsd
    ? (["usdValue", "minswapUsdValue", "wingridersUsdValue"] as const)
    : (["adaValue", "minswapAdaValue", "wingridersAdaValue"] as const)

  const values = data.flatMap((entry) =>
    keys.map((key) => entry[key]).filter((v): v is number => v != null),
  )

  if (values.length === 0) return { min: 0, max: 0 }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

const getDynamicYAxis = (min: number, max: number, isUsd: boolean) => {
  // if the currency is USD, define the middle point as 1$
  // if the currency is ADA, define the lowest point as 0₳
  if (isUsd) {
    const dist = Math.max(Math.abs(max - 1), Math.abs(min - 1))
    const step = 0.05
    const radius = Math.ceil(dist / step) * step
    const points = [1 - radius, 1 - radius / 2, 1, 1 + radius / 2, 1 + radius]
    return points
  } else {
    const step = max > 10 ? 10 : 5
    const yAxisMax = Math.ceil(max / step) * step
    const interval = yAxisMax / 4
    const points = [0, interval, interval * 2, interval * 3, yAxisMax]
    return points
  }
}

export const DjedDexPriceChart: React.FC<DjedDexPriceChartProps> = ({
  data,
  currency,
}) => {
  const { NETWORK } = env
  const isUsd = currency.value === "USD"

  const { max, min } = getMaxMin(data, isUsd)
  const ticks = getDynamicYAxis(min, max, isUsd)

  const formatAxisValue = (val: number) => {
    const abs = Math.abs(val)
    if (abs < 2) return val.toFixed(3)
    if (abs < 1_000) return val.toFixed(2)
    if (abs < 1_000_000) return `${(val / 1_000).toFixed(1)}k`
    return `${(val / 1_000_000).toFixed(1)}M`
  }

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: isUsd ? "usdValue" : "adaValue",
      name: `Djed`,
      stroke: "var(--color-supportive-1-500)",
    },
    ...(NETWORK === "Mainnet"
      ? [
          {
            dataKey: isUsd ? "minswapUsdValue" : "minswapAdaValue",
            name: `Minswap`,
            stroke: "var(--color-supportive-2-500)",
          },
          {
            dataKey: isUsd ? "wingridersUsdValue" : "wingridersAdaValue",
            name: `WingRiders`,
            stroke: "var(--color-supportive-4-400)",
          },
        ]
      : []),
  ]

  return (
    <FinancialAreaChart
      data={data}
      xKey="timestamp"
      lines={lines}
      yTickFormatter={yTickFormatter}
      yTicks={ticks}
    />
  )
}
