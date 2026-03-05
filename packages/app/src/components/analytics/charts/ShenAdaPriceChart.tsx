"use client"

import { useMemo } from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
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

  const { rows } = useMemo(() => {
    if (!data?.SHEN?.length) {
      return {
        rows: [] as ChartRow[],
      }
    }

    const shenData = data.SHEN
    const adaData = data.ADA ?? []

    const mapped: ChartRow[] = shenData.map((shenEntry, i) => {
      const adaEntry = adaData[i]

      if (currency.value === "USD") {
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

    return { rows: mapped }
  }, [data, currency, isMobile])

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${Number(value).toFixed(2)}`
      : `₳${Number(value).toFixed(4)}`

  const lines =
    currency.value === "USD"
      ? [
          {
            dataKey: "shenUsd",
            name: "SHEN (USD)",
            stroke: "var(--color-supportive-1-500)",
          },
          {
            dataKey: "adaUsd",
            name: "ADA (USD)",
            stroke: "var(--color-supportive-2-500)",
          },
        ]
      : [
          {
            dataKey: "shenAda",
            name: "SHEN (ADA)",
            stroke: "var(--color-supportive-1-500)",
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
