"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useViewport } from "@/hooks/useViewport"
import { useMemo } from "react"
import { type ShenYieldChartEntry } from "../useAnalyticsData"

type ShenYieldChartProps = {
  title?: string
  data: ShenYieldChartEntry[]
}

type ChartRow = {
  date: string | number
  realized?: number
  projected?: number
}

const formatPercentAxisValue = (val: number) => {
  if (Number.isNaN(val)) return "0%"
  const percentValue = Math.abs(val) <= 1 ? val * 100 : val
  if (Math.abs(percentValue) < 1) return `${percentValue.toFixed(2)}%`
  if (Math.abs(percentValue) < 10) return `${percentValue.toFixed(1)}%`
  return `${Math.round(percentValue)}%`
}

const yTickFormatter = (value: number | string) =>
  formatPercentAxisValue(Number(value))

export const ShenYieldChart: React.FC<ShenYieldChartProps> = ({ data }) => {
  const { isMobile } = useViewport()
  const { rows } = useMemo(() => {
    if (!data?.length) {
      return { rows: [] }
    }

    const mapped: ChartRow[] = data.map((entry) => ({
      date: entry.timestamp,
      realized: entry.realized,
      projected: entry.projected,
    }))

    return { rows: mapped }
  }, [data, isMobile])

  const lines = [
    {
      dataKey: "projected",
      name: "Projected",
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: "realized",
      name: "Realized",
      stroke: "var(--color-yellow-400)",
    },
  ]

  return (
    <FinancialAreaChart
      data={rows}
      xKey="date"
      lines={lines}
      yTickFormatter={yTickFormatter}
    />
  )
}
