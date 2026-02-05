"use client"

import { MultiAreaChart } from "@/components/MultiAreaChart"
import { useViewport } from "@/hooks/useViewport"
import { aggregateByBucket, type DataRow } from "@/utils/timeseries"
import { useMemo } from "react"
import { type ReserveRatioChartEntry } from "../useAnalyticsData"
import { getAnalyticsTimeInterval } from "@/lib/utils"

type ReserveRatioOverTimeChartProps = {
  title?: string
  data: ReserveRatioChartEntry[]
}

export const ReserveRatioOverTimeChart: React.FC<
  ReserveRatioOverTimeChartProps
> = ({ title = "Reserve Ratio Over Time", data }) => {
  const { isMobile } = useViewport()
  const { formattedData, xAxisFormatter } = useMemo(() => {
    if (!data || data.length === 0)
      return { formattedData: [], xAxisFormatter: undefined }

    const totalDays = data.length

    const formatter = (value: string | number, index?: number) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value)

      const month = date.toLocaleString(undefined, { month: "short" })
      const year = date.getFullYear()
      const displayedYear = date.toLocaleString(undefined, { year: "numeric" })

      if (totalDays <= 365) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }

      if (index === 0) return `${month}, ${displayedYear}`

      if (index !== undefined && data[index - 1]) {
        const prevDate = new Date(data[index - 1].date as string)
        if (year !== prevDate.getFullYear()) {
          return `${month}, ${displayedYear}`
        }
      }

      return totalDays > 365 * 2 ? displayedYear : month
    }

    const newInterval = getAnalyticsTimeInterval(totalDays, isMobile)

    const dataRows: DataRow[] = []
    for (let i = 0; i < data.length - 1; i++) {
      dataRows.push({
        date: data[i].date,
        reserveRatio: data[i].value,
      } as unknown as DataRow)
    }

    const results = aggregateByBucket(
      dataRows,
      newInterval ?? 0,
      new Date(data[0].date),
      {
        reserveRatio: ["avg"],
      },
    )

    if (totalDays > 365) {
      results[results.length - 1] = {
        date: new Date(data[data.length - 1].date).toISOString(),
        reserveRatio_avg: data[data.length - 1].value,
      } as unknown as DataRow
    } else {
      results.push({
        date: new Date(data[data.length - 1].date).toISOString(),
        reserveRatio_avg: data[data.length - 1].value,
      } as unknown as DataRow)
    }

    return { formattedData: results, xAxisFormatter: formatter }
  }, [data])

  const tickFormatter = (value: number) => `${value}\u00A0%`
  const areas = [
    {
      dataKey: "reserveRatio_avg",
      name: "Reserve Ratio",
      tooltipLabel: "Reserve Ratio",
      strokeColor: `var(--color-supportive-2-500)`,
      fillColor: "transparent",
      fillOpacity: 0,
      strokeWidth: 2,
    },
  ]
  const referenceLines = [
    { y: 400, label: "400%", stroke: "#EF4444" },
    { y: 800, label: "800%", stroke: "#10B981" },
  ]

  let currentPoint = undefined
  const lastEntry = formattedData[formattedData.length - 1]

  if (lastEntry && lastEntry.reserveRatio_avg !== undefined) {
    const currentRatio = Number(lastEntry.reserveRatio_avg)
    const currentDate = lastEntry.date as string | number

    currentPoint = {
      x: currentDate,
      y: currentRatio,
      label: {
        text: "Current Ratio",
        size: 10,
        color: "var(--color-offwhite)",
      },
      dot: {
        fill: "var(--color-supportive-2-500)",
        stroke: "var(--color-offwhite)",
      },
    }
  }

  return (
    <MultiAreaChart
      title={title}
      data={formattedData}
      xKey="date"
      interval={0}
      xTickFormatter={xAxisFormatter}
      tickFormatter={tickFormatter}
      yDomain={[0, 1000]}
      graphWidth={20}
      margin={{ top: 6, right: 14, left: 24, bottom: 6 }}
      referenceLines={referenceLines}
      currentPoint={currentPoint}
      areas={areas}
      showLegend={true}
    />
  )
}
