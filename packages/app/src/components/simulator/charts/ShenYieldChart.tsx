"use client"

import React, { useMemo } from "react"
import { MultiAreaChart } from "./MultiAreaChart"
import type { CreditEntry } from "@/lib/staking"
import {
  aggregateByBucket,
  type AggregationConfig,
  type DataRow,
} from "@/utils/timeseries"

type ShenYieldChartProps = {
  buyDate: string
  sellDate: string
  initialHoldings: number
  finalHoldings: number
  buyPrice: number
  sellPrice: number
  buyFees: number
  sellFees: number
  feesEarned: number
  stakingRewards: CreditEntry[]
}

export const ShenYieldChart: React.FC<ShenYieldChartProps> = ({
  buyDate,
  sellDate,
  initialHoldings,
  buyPrice,
  sellPrice,
  buyFees,
  sellFees,
  feesEarned,
  stakingRewards,
}) => {
  const aggregations: AggregationConfig = {
    earnings: ["avg"],
    usdEarningsValue: ["avg"],
  }

  const { results, yDomain } = useMemo(() => {
    if (!buyDate || !sellDate || initialHoldings <= 0)
      return { results: [], yDomain: [0, 100] as [number, number] }

    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = new Date(buyDate)
    const endDate = new Date(sellDate)
    const totalDays =
      Math.round((endDate.getTime() - startDate.getTime()) / dayInMs) + 1

    const priceStep =
      totalDays > 1 ? (sellPrice - buyPrice) / (totalDays - 1) : 0

    const rewardsMap = stakingRewards.reduce(
      (acc, entry) => {
        const d = new Date(entry.date).toDateString()
        acc[d] = (acc[d] || 0) + entry.reward
        return acc
      },
      {} as Record<string, number>,
    )

    const data: DataRow[] = []
    let cumulativeEarnings = 0
    const dailyFeesEarned = totalDays > 0 ? feesEarned / totalDays : 0

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * dayInMs)
      cumulativeEarnings += rewardsMap[currentDate.toDateString()] || 0
      cumulativeEarnings += dailyFeesEarned
      const priceForDay = buyPrice + i * priceStep

      data.push({
        date: currentDate.toISOString(),
        earnings: cumulativeEarnings,
        usdEarningsValue: cumulativeEarnings * priceForDay,
      } as unknown as DataRow)
    }

    const interval = totalDays > 365 ? 30 * dayInMs : 7 * dayInMs
    const chartData = aggregateByBucket(data, interval, startDate, aggregations)

    if (chartData.length > 0) {
      chartData[0].buyFee = buyFees
      chartData[0].usdBuyFeeValue = buyFees * buyPrice
      chartData[chartData.length - 1].sellFee = sellFees
      chartData[chartData.length - 1].usdSellFeeValue = sellFees * sellPrice
    }

    const allValues = data.map((d) => d.earnings as number)
    const minY = Math.floor(Math.min(...allValues) * 0.98)
    const maxY = Math.ceil(Math.max(...allValues) * 1.02)

    return { results: chartData, yDomain: [minY, maxY] as [number, number] }
  }, [
    buyDate,
    sellDate,
    initialHoldings,
    buyPrice,
    sellPrice,
    buyFees,
    sellFees,
    feesEarned,
    stakingRewards,
  ])

  const areas = [
    {
      dataKey: "buyFee",
      name: "Fees",
      tooltipLabel: "ADA (Buy Fee)",
      strokeColor: "transparent",
      fillColor: "transparent",
      fillOpacity: 0,
    },
    {
      dataKey: "earnings_avg",
      name: "ADA Earnings",
      tooltipLabel: "ADA Earnings",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(---color-gradient-radial-shen)",
      fillOpacity: 0.1,
      gradientType: "radial" as const,
      radialGradientColors: {
        color1: "var(--color-supportive-3-25)",
        color2: "var(--color-supportive-3-500)",
        color3: "var(--color-supportive-3-25)",
        stop1: 0,
        stop2: 50,
        stop3: 100,
        opacity1: 0.1,
        opacity2: 0.1,
        opacity3: 0.1,
      },
    },
    {
      dataKey: "sellFee",
      name: "Fees",
      tooltipLabel: "ADA (Sell Fee)",
      strokeColor: "transparent",
      fillColor: "transparent",
      fillOpacity: 0,
    },
  ]

  return (
    <div className="w-full">
      <MultiAreaChart
        title="ADA Holdings"
        data={results as { [key: string]: string | number | undefined }[]}
        xKey="date"
        yDomain={yDomain}
        areas={areas}
        tooltipFormatter={(val, dataKey, payload) => {
          const usdKey =
            dataKey === "buyFee"
              ? "usdBuyFeeValue"
              : dataKey === "sellFee"
                ? "usdSellFeeValue"
                : "usdEarningsValue_avg"
          const usd = payload[usdKey] as number | undefined
          const ada = Number.isFinite(val) ? val : 0
          const adaFormatted =
            Math.abs(ada) >= 1000
              ? `${(ada / 1000).toFixed(1)}K`
              : ada.toFixed(4)
          const usdFormatted =
            typeof usd === "number" && Number.isFinite(usd)
              ? usd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"
          return `${adaFormatted} ($${usdFormatted})`
        }}
      />
    </div>
  )
}
