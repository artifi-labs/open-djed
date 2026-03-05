"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useViewport } from "@/hooks/useViewport"
import { useMemo } from "react"
import { type Currency } from "../useAnalyticsData"
import { Legend } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"
import { formatAxisValue } from "@/lib/utils"

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

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

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
