"use client"

import { MultiAreaChart } from "@/components/MultiAreaChart"
import { useViewport } from "@/hooks/useViewport"
import {
  aggregateByBucket,
  type AggregationConfig,
  type DataRow,
} from "@/utils/timeseries"
import { getAnalyticsTimeInterval } from "@/lib/utils"
import { useMemo } from "react"
import type { Currency, TokenPriceByToken } from "../useAnalyticsData"

type ShenAdaPriceChartProps = {
  title?: string
  data: TokenPriceByToken
  currency: Currency
}

export const ShenAdaPriceChart: React.FC<ShenAdaPriceChartProps> = ({
  title = "SHEN Price & ADA Price",
  data,
  currency,
}) => {
  const { isMobile } = useViewport()

  const { results, xAxisFormatter } = useMemo(() => {
    if (!data?.SHEN?.length) {
      return {
        results: [] as DataRow[],
        xAxisFormatter: (v: string | number) => String(v),
      }
    }

    const shenData = data.SHEN
    const adaData = data.ADA ?? []
    const totalDays = shenData.length

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

      if (index !== undefined && results[index - 1]) {
        const prevDate = new Date(results[index - 1].date)
        if (year !== prevDate.getFullYear()) {
          return `${month}, ${displayedYear}`
        }
      }

      return totalDays > 365 * 2 ? displayedYear : month
    }

    const rows: DataRow[] = shenData.map((shenEntry, i) => {
      const adaEntry = adaData[i]

      if (currency === "USD") {
        return {
          date: shenEntry.timestamp,
          shenUsd: shenEntry.usdValue,
          adaUsd: adaEntry ? adaEntry.usdValue : 0,
        } as unknown as DataRow
      }

      return {
        date: shenEntry.timestamp,
        shenAda: shenEntry.adaValue,
      } as unknown as DataRow
    })

    const aggregations: AggregationConfig =
      currency === "USD"
        ? { shenUsd: ["avg"], adaUsd: ["avg"] }
        : { shenAda: ["avg"] }

    const interval = getAnalyticsTimeInterval(totalDays, isMobile)

    const aggregated = aggregateByBucket(
      rows,
      interval ?? 0,
      new Date(rows[0].date),
      aggregations,
    )

    return { results: aggregated, xAxisFormatter: formatter }
  }, [data, currency, isMobile])

  const yTickFormatter = (value: number) =>
    currency === "USD" ? `$${value.toFixed(2)}` : value.toFixed(4)

  const areas =
    currency === "USD"
      ? [
          {
            dataKey: "shenUsd_avg",
            name: "SHEN (USD)",
            tooltipLabel: "SHEN (USD)",
            strokeColor: "var(--color-accent-3)",
            fillColor: "transparent",
            fillOpacity: 0,
            strokeWidth: 2,
          },
          {
            dataKey: "adaUsd_avg",
            name: "ADA (USD)",
            tooltipLabel: "ADA (USD)",
            strokeColor: "var(--color-accent-1)",
            fillColor: "transparent",
            fillOpacity: 0,
            strokeWidth: 2,
            strokeDasharray: "5 5",
          },
        ]
      : [
          {
            dataKey: "shenAda_avg",
            name: "SHEN (ADA)",
            tooltipLabel: "SHEN (ADA)",
            strokeColor: "var(--color-accent-3)",
            fillColor: "transparent",
            fillOpacity: 0,
            strokeWidth: 2,
          },
        ]

  return (
    <MultiAreaChart
      title={title}
      data={results}
      xKey="date"
      interval={0}
      areas={areas}
      xTickFormatter={xAxisFormatter}
      tickFormatter={yTickFormatter}
      height={304}
      margin={{ top: 6, right: 14, left: 24, bottom: 6 }}
      showLegend={true}
    />
  )
}
