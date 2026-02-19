import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import type { Currency, TokenPriceChartEntry } from "../useAnalyticsData"

type TokenPriceChartProps = {
  data: TokenPriceChartEntry[]
  currency: Currency
}

export const DjedPriceChart: React.FC<TokenPriceChartProps> = ({
  data,
  currency,
}) => {

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${Number(value).toFixed(3)}` // TODO: PASSAR UMA FORMATTER DIFERENTE PARA A LEGENDA
      : Number(value).toFixed(4)

  const lines =
    currency.value === "USD"
      ? [
          {
            dataKey: "usdValue",
            name: "Djed",
            stroke: "var(--color-supportive-1-500)",
          },
          {
            dataKey: "wingridersDjedUsdPrice",
            name: "WingRiders",
            stroke: "var(--color-supportive-2-300)",
          },
          {
            dataKey: "minswapDjedUsdPrice",
            name: "Minswap",
            stroke: "var(--color-yellow-500)",
          },
        ]
      : [
          {
            dataKey: "adaValue",
            name: "Djed",
            stroke: "var(--color-supportive-1-500)",
          },
          {
            dataKey: "wingridersDjedAdaPrice",
            name: "WingRiders",
            stroke: "var(--color-supportive-2-300)",
          },
          {
            dataKey: "minswapDjedAdaPrice",
            name: "Minswap",
            stroke: "var(--color-yellow-500)",
          },
        ]

  console.log(data)
  return (
    <FinancialAreaChart
      data={data}
      xKey="timestamp"
      lines={lines}
      yTickFormatter={yTickFormatter}
    />
  )
}
