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

  const { rows, xTickFormatter } = useMemo(() => {
    if (!data?.length) {
      return { rows: [], xTickFormatter: undefined }
    }

    const totalDays = data.length

    const formatter = (value: string | number, index?: number) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value)

      const month = date.toLocaleString(undefined, { month: "short" })
      const year = date.getFullYear()

      if (totalDays <= 365) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }

      if (index === 0) return `${month} ${year}`

      return totalDays > 365 * 2 ? String(year) : month
    }

    const mapped: ChartRow[] = data.map((entry) => ({
      date: entry.timestamp,
      reserveRatio: entry.reserveRatio,
    }))

    return { rows: mapped, xTickFormatter: formatter }
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

  return (
    <FinanceLineChart
      data={rows}
      xKey="date"
      lines={lines}
      xTickFormatter={xTickFormatter}
      yTickFormatter={yTickFormatter}
    />
  )
}
