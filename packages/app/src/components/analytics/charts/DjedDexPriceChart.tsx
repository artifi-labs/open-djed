"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useMemo } from "react"
import { type DjedDexPrices, type Currency } from "../useAnalyticsData"
import { Legend } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"

type DjedDexPriceChartProps = {
  data: DjedDexPrices[]
  currency: Currency
}

type ChartRow = {
  date: string
  djedPrice: number
  minswapPrice: number
  wingridersPrice: number
}

export const DjedDexPriceChart: React.FC<DjedDexPriceChartProps> = ({
  data,
  currency,
}) => {
  const isUsd = currency.value === "USD"

  const { rows } = useMemo(() => {
    if (!data?.length) {
      return { rows: [] }
    }

    const mapped: ChartRow[] = data.map((entry) => ({
      date: entry.timestamp,
      djedPrice: Number(isUsd ? entry.usdValue : entry.adaValue),
      minswapPrice: Number(
        isUsd ? entry.minswapUsdValue : entry.minswapAdaValue,
      ),
      wingridersPrice: Number(
        isUsd ? entry.wingridersUsdValue : entry.wingridersAdaValue,
      ),
    }))

    return { rows: mapped }
  }, [data, isUsd])

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
      dataKey: "djedPrice",
      name: `Djed`,
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: "minswapPrice",
      name: `Minswap`,
      stroke: "var(--color-supportive-2-500)",
    },
    {
      dataKey: "wingridersPrice",
      name: `WingRiders`,
      stroke: "var(--color-supportive-4-400)",
    },
  ]

  return (
    <FinancialAreaChart
      data={rows}
      xKey="date"
      lines={lines}
      yTickFormatter={yTickFormatter}
    >
      <Legend
        content={<ChartLegend />}
        verticalAlign="top"
        wrapperStyle={{ left: 0, width: "100%", top: 0 }}
      />
    </FinancialAreaChart>
  )
}
