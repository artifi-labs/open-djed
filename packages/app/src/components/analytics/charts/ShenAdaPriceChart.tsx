"use client"

import { useMemo } from "react"
import { FinanceLineChart } from "@/components/charts/FinanceLineChart"
import { useViewport } from "@/hooks/useViewport"
import type { Currency, TokenPriceByToken } from "../useAnalyticsData"

type ShenAdaPriceChartProps = {
  data: TokenPriceByToken
  currency: Currency
}

type ChartRow = {
  date: string | number
  shenUsd?: number
  adaUsd?: number
  shenAda?: number
}

export const ShenAdaPriceChart: React.FC<ShenAdaPriceChartProps> = ({
  data,
  currency,
}) => {
  const { isMobile } = useViewport()

  const { rows, xTickFormatter } = useMemo(() => {
    if (!data?.SHEN?.length) {
      return {
        rows: [] as ChartRow[],
        xTickFormatter: (v: string | number) => String(v),
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

      if (totalDays <= 365) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }

      if (index === 0) return `${month} ${year}`

      return totalDays > 365 * 2 ? String(year) : month
    }

    const mapped: ChartRow[] = shenData.map((shenEntry, i) => {
      const adaEntry = adaData[i]

      if (currency === "USD") {
        return {
          date: shenEntry.timestamp,
          shenUsd: shenEntry.usdValue,
          adaUsd: adaEntry?.usdValue ?? 0,
        }
      }

      return {
        date: shenEntry.timestamp,
        shenAda: shenEntry.adaValue,
      }
    })

    return { rows: mapped, xTickFormatter: formatter }
  }, [data, currency, isMobile])

  const yTickFormatter = (value: number | string) =>
    currency === "USD"
      ? `$${Number(value).toFixed(2)}`
      : Number(value).toFixed(4)

  const lines =
    currency === "USD"
      ? [
          {
            dataKey: "shenUsd",
            name: "SHEN (USD)",
            stroke: "var(--color-accent-3)",
          },
          {
            dataKey: "adaUsd",
            name: "ADA (USD)",
            stroke: "var(--color-accent-1)",
          },
        ]
      : [
          {
            dataKey: "shenAda",
            name: "SHEN (ADA)",
            stroke: "var(--color-accent-3)",
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
