import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { type Currency } from "../useAnalyticsData"
import { env } from "@/lib/envLoader"
import type { DjedDexPricesResponse } from "@/queries/analytics/dexPrices/djedDexPrices.schema"

type DjedDexPriceChartProps = {
  data: DjedDexPricesResponse
  currency: Currency
}

export const DjedDexPriceChart: React.FC<DjedDexPriceChartProps> = ({
  data,
  currency,
}) => {
  const { NETWORK } = env
  const isUsd = currency.value === "USD"

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
    />
  )
}
