"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useViewport } from "@/hooks/useViewport"
import { useMemo } from "react"
import { type Currency } from "../useAnalyticsData"
import { Legend } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"

type ShenMarketCapChartProps = {
  title?: string
  data: {
    timestamp: string
    adaValue: string
    usdValue: string
  }[]
  currency: Currency
}

type ChartRow = {
  date: string | number
  adaValue?: number
  usdValue?: number
}

export const ShenMarketCapChart: React.FC<ShenMarketCapChartProps> = ({
  data,
  currency,
}) => {
  const { isMobile } = useViewport()
  const valueKey = currency.value === "USD" ? "usdValue" : "adaValue"

  const { rows } = useMemo(() => {
    if (!data?.length) {
      return { rows: [] }
    }

    const mapped: ChartRow[] = data.map((entry) => ({
      date: entry.timestamp,
      adaValue: Number(entry.adaValue),
      usdValue: Number(entry.usdValue),
    }))

    return { rows: mapped }
  }, [data, isMobile])

  const formatAxisValue = (val: number) => {
    const abs = Math.abs(val)
    if (abs < 1) return val.toFixed(3)
    if (abs < 1_000) return Math.round(val).toString()
    if (abs < 1_000_000) return `${(val / 1_000).toFixed(1)}k`
    if (abs < 1_000_000_000) return `${(val / 1_000_000).toFixed(1)}M`
    return `${(val / 1_000_000_000).toFixed(1)}B`
  }

  const yTickFormatter = (value: number | string) =>
    formatAxisValue(Number(value))

  const lines = [
    {
      dataKey: valueKey,
      name: currency.value === "USD" ? "USD Value" : "ADA Value",
      stroke:
        currency.value === "USD"
          ? "var(--color-supportive-1-500)"
          : "var(--color-supportive-2-500)",
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
