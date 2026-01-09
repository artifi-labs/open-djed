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
  stakingRewards: CreditEntry[]
}

export const ShenYieldChart: React.FC<ShenYieldChartProps> = ({
  buyDate,
  sellDate,
  initialHoldings,
  buyPrice,
  sellPrice,
  stakingRewards,
}) => {
  const aggregations: AggregationConfig = {
    ADA: ["avg"],
    usdValue: ["avg"],
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
    let currentHoldings = initialHoldings

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * dayInMs)
      currentHoldings += rewardsMap[currentDate.toDateString()] || 0
      const priceForDay = buyPrice + i * priceStep

      data.push({
        date: currentDate.toISOString(),
        ADA: currentHoldings,
        usdValue: currentHoldings * priceForDay,
      } as unknown as DataRow)
    }

    const interval = totalDays > 365 ? 30 * dayInMs : 7 * dayInMs
    const chartData = aggregateByBucket(data, interval, startDate, aggregations)

    if (chartData.length > 0) {
      chartData[0].ADA_avg_buy_fees = chartData[0].ADA_avg
      chartData[chartData.length - 1].ADA_avg_sell_fees =
        chartData[chartData.length - 1].ADA_avg
    }

    const allValues = data.map((d) => d.ADA as number)
    const minY = Math.floor(Math.min(...allValues) * 0.98)
    const maxY = Math.ceil(Math.max(...allValues) * 1.02)

    return { results: chartData, yDomain: [minY, maxY] as [number, number] }
  }, [buyDate, sellDate, initialHoldings, buyPrice, sellPrice, stakingRewards])

  const areas = [
    {
      dataKey: "ADA_avg_buy_fees",
      name: "Fees",
      tooltipLabel: "ADA (Buy Fee)",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(--color-supportive-3-500)",
      fillOpacity: 0.2,
      hideOnDuplicate: true,
      tag: "fees",
    },
    {
      dataKey: "ADA_avg",
      name: "ADA Holdings",
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
      dataKey: "ADA_avg_sell_fees",
      name: "Fees",
      tooltipLabel: "ADA (Sell Fee)",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(--color-supportive-3-500)",
      fillOpacity: 0.2,
      hideOnDuplicate: true,
      tag: "fees",
    },
  ]

  return (
    <div className="w-full">
      <MultiAreaChart
        data={results as { [key: string]: string | number | undefined }[]}
        xKey="date"
        yDomain={yDomain}
        areas={areas}
        tickFormatter={(val) => `₳${val.toLocaleString()}`}
        tooltipFormatter={(val, name, payload) => {
          const usd = payload[`usdValue_avg`] as number
          return `₳${val.toFixed(2)} ($${usd?.toLocaleString(undefined, { minimumFractionDigits: 2 })})`
        }}
      />
    </div>
  )
}
