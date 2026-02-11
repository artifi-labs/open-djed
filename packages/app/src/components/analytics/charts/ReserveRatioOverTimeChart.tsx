"use client"

import { FinanceLineChart } from "@/components/charts/FinanceLineChart"
import { useViewport } from "@/hooks/useViewport"
import { useMemo } from "react"
import { type ReserveRatioChartEntry } from "../useAnalyticsData"

type ReserveRatioOverTimeChartProps = {
  data: ReserveRatioChartEntry[]
}

type ChartRow = {
  date: string | number
  reserveRatio: number
}

export const ReserveRatioOverTimeChart: React.FC<
  ReserveRatioOverTimeChartProps
> = ({ data }) => {
  const { isMobile } = useViewport()

  const { rows } = useMemo(() => {
    if (!data?.length) {
      return { rows: [] }
    }

    const mapped: ChartRow[] = data.map((entry) => ({
      date: entry.timestamp,
      reserveRatio: entry.reserveRatio,
    }))

    return { rows: mapped }
  }, [data, isMobile])

  const yTickFormatter = (value: number | string) =>
    `${Number(value).toFixed(0)}%`

  const lines = [
    {
      dataKey: "reserveRatio",
      name: "Reserve Ratio",
      stroke: "var(--color-supportive-2-500)",
    },
  ]

  const referenceAreas = [
    {
      y1: 400,
      y2: 800,
      fill: "var(--color-supportive-3-100)",
      fillOpacity: 0.1,
    },
  ]

  return (
    <FinanceLineChart
      data={rows}
      xKey="date"
      lines={lines}
      yTickFormatter={yTickFormatter}
      yTicks={[0, 200, 400, 600, 800, 1000, 1200]}
      referenceAreas={referenceAreas}
    />
  )
}
