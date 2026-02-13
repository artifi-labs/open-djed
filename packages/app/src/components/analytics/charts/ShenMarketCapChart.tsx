import { MultiAreaChart } from "@/components/MultiAreaChart"
import { useViewport } from "@/hooks/useViewport"
import { getAnalyticsTimeInterval } from "@/lib/utils"
import { type DataRow, aggregateByBucket } from "@/utils/timeseries"
import { useMemo } from "react"

type ShenMarketCapChartProps = {
  title?: string
  data: {
    timestamp: string
    adaValue: string
    usdValue: string
  }[]
  currency: "USD" | "ADA"
}

export const ShenMarketCapChart: React.FC<ShenMarketCapChartProps> = ({
  title = "SHEN Market Cap Over Time",
  data,
  currency,
}) => {
  const valueKey = currency === "USD" ? "usdValue" : "adaValue"
  const numericData = useMemo(
    () =>
      data.map((entry) => ({
        ...entry,
        adaValue: Number(entry.adaValue),
        usdValue: Number(entry.usdValue),
      })),
    [data],
  )
  const { isMobile } = useViewport()
  const { formattedData, xAxisFormatter } = useMemo(() => {
    if (!numericData || numericData.length === 0)
      return { formattedData: [], xAxisFormatter: undefined }

    const totalDays = numericData.length

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

      if (index !== undefined && numericData[index - 1]) {
        const prevDate = new Date(numericData[index - 1].timestamp as string)
        if (year !== prevDate.getFullYear()) {
          return `${month}, ${displayedYear}`
        }
      }

      return totalDays > 365 * 2 ? displayedYear : month
    }

    const newInterval = getAnalyticsTimeInterval(totalDays, isMobile)

    const dataRows: DataRow[] = []
    for (let i = 0; i < numericData.length - 1; i++) {
      dataRows.push({
        date: numericData[i].timestamp,
        adaValue: numericData[i].adaValue,
        usdValue: numericData[i].usdValue,
      } as unknown as DataRow)
    }

    const results = aggregateByBucket(
      dataRows,
      newInterval ?? 0,
      new Date(numericData[0].timestamp),
      {
        adaValue: ["avg"],
        usdValue: ["avg"],
      },
    )

    return { formattedData: results, xAxisFormatter: formatter }
  }, [numericData, isMobile])

  const formatSmall = (val: number) => {
    const rounded = val.toFixed(3)
    return rounded.replace(/\.?0+$/, "")
  }

  const formatAxisValue = (val: number) => {
    const sign = val < 0 ? "-" : ""
    const absVal = Math.abs(val)

    if (absVal === 0) return "0"
    if (absVal > 0 && absVal < 1) return `${sign}${formatSmall(absVal)}`
    if (absVal < 1000) return `${sign}${Math.round(absVal)}`
    if (absVal < 10000) return `${sign}${(absVal / 1000).toFixed(1)}k`
    if (absVal < 100000) return `${sign}${Math.round(absVal / 1000)}k`
    if (absVal < 1000000) return `${sign}${Math.round(absVal / 1000)}k`
    if (absVal < 10000000) return `${sign}${(absVal / 1000000).toFixed(1)}M`
    if (absVal < 1000000000) return `${sign}${Math.round(absVal / 1000000)}M`

    const billions = absVal / 1000000000
    if (absVal < 10000000000) return `${sign}${billions.toFixed(1)}B`
    return `${sign}${Math.round(billions)}B`
  }

  // format y-axis ticks as USD
  const yTickFormatter = (value: number) => `${formatAxisValue(value)}`

  const areas = [
    {
      dataKey: `${valueKey}_avg`,
      name: currency === "USD" ? "USD Value" : "ADA Value",
      stroke:
        currency === "USD"
          ? "var(--color-asset-usd-500)"
          : "var(--color-asset-ada-500)",
      fill:
        currency === "USD"
          ? "var(--color-asset-usd-500)"
          : "var(--color-asset-ada-500)",
      fillOpacity: 0.12,
      tooltipLabel: currency === "USD" ? "USD Value" : "ADA Value",
    },
  ]

  const maxValue =
    numericData.length > 0
      ? Math.max(0, ...numericData.map((entry) => entry[valueKey]))
      : 0
  const domainMax = maxValue > 0 ? maxValue * 1.1 : 1

  return (
    <MultiAreaChart
      title={title}
      data={formattedData}
      xKey="date"
      interval={0}
      xTickFormatter={xAxisFormatter}
      tickFormatter={yTickFormatter}
      yDomain={[0, domainMax]}
      graphWidth={20}
      margin={{ top: 6, right: 14, left: 24, bottom: 6 }}
      areas={areas}
      showLegend={true}
    />
  )
}
