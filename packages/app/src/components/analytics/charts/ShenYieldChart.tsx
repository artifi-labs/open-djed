"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useMemo } from "react"
import { type ShenYieldChartEntry } from "../useAnalyticsData"
import { ReferenceDot } from "recharts"

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
  const { rows, anchorPoint } = useMemo(() => {
    if (!data?.length) return { rows: [], anchorPoint: null }

    const lastRealizedIndex = data.findLastIndex((d) => !d.isProjected)
    const anchor = data[lastRealizedIndex]

    const mapped: ChartRow[] = data.map((entry, index) => {
      const isProjected = entry.isProjected
      const val = entry.yield

      return {
        date: entry.timestamp,
        realized: !isProjected ? val : undefined,
        projected: isProjected || index === lastRealizedIndex ? val : undefined,
      }
    })

    return {
      rows: mapped,
      anchorPoint: anchor ? { x: anchor.timestamp, y: anchor.yield } : null,
    }
  }, [data])

  const lines = [
    {
      dataKey: "realized",
      name: "Realized",
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: "projected",
      name: "Projected",
      stroke: "var(--color-on-warning-secondary)",
    },
  ]

  return (
    <FinancialAreaChart
      data={rows}
      xKey="date"
      lines={lines}
      yTickFormatter={yTickFormatter}
    >
      {anchorPoint && (
        <ReferenceDot
          x={anchorPoint.x}
          y={anchorPoint.y}
          r={3}
          fill="var(--color-supportive-1-500)"
          stroke="var(--color-supportive-1-500)"
          strokeWidth={1}
        />
      )}
    </FinancialAreaChart>
  )
}
