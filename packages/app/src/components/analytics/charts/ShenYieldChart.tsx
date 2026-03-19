"use client"

import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import type { ShenYieldChartEntry } from "@/queries/analytics/shenYield/shenYield.schema"
import { useMemo } from "react"
import { type DotProps } from "recharts"

type ShenYieldChartProps = {
  data: ShenYieldChartEntry[]
}

const formatPercentAxisValue = (val: number) => {
  if (Number.isNaN(val)) return "0%"
  const percentValue = Math.abs(val) <= 1 ? val * 100 : val
  if (Math.abs(percentValue) < 1) return `${percentValue.toFixed(2)}%`
  if (Math.abs(percentValue) < 10) return `${percentValue.toFixed(1)}%`
  return `${Math.round(percentValue)}%`
}

export const ShenYieldChart: React.FC<ShenYieldChartProps> = ({ data }) => {
  const lastRealizedIndex = data.findLastIndex((d) => !d.isProjected)

  const { rows } = useMemo(() => {
    if (!data?.length) return { rows: [] }

    const mapped = data.map((entry, index) => {
      const isProjected = entry.isProjected
      const val = entry.yield

      return {
        timestamp: entry.timestamp,
        realized: !isProjected ? val : undefined,
        projected: isProjected || index === lastRealizedIndex ? val : undefined,
      }
    })

    return { rows: mapped }
  }, [data])

  /**
   * Custom dot renderer to highlight the last realized data point.
   * It checks if the current index matches the last realized index and if the data point is not projected.
   * If both conditions are met, it renders a circle with a specific style to make it stand out on the chart.
   */
  const renderLastDot = (
    props: DotProps & { payload: ShenYieldChartEntry; index: number },
  ) => {
    const { cx, cy, index, payload } = props
    if (index !== lastRealizedIndex || payload.isProjected) return null

    return (
      <circle
        cx={cx}
        cy={cy}
        r={2}
        fill="var(--color-supportive-1-500)"
        stroke="var(--color-supportive-1-500)"
      />
    )
  }

  const lines = [
    {
      dataKey: "realized",
      name: "Realized",
      stroke: "var(--color-supportive-1-500)",
      dot: renderLastDot,
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
      xKey="timestamp"
      lines={lines}
      yTickFormatter={(value) => formatPercentAxisValue(Number(value))}
    />
  )
}
