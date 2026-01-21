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
  finalHoldings,
  buyPrice,
  sellPrice,
  buyFees,
  sellFees,
  feesEarned,
  stakingRewards,
}) => {
  const aggregations: AggregationConfig = {
    ADA: ["avg"],
    ADAAfterFees: ["avg"],
    usdValue: ["avg"],
  }

  const { results, yDomain, xAxisFormater } = useMemo(() => {
    if (!buyDate || !sellDate || initialHoldings <= 0)
      return {
        results: [],
        yDomain: [0, 100] as [number, number],
        xAxisFormater: (value: string | number) => String(value),
      }

    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = new Date(buyDate)
    const endDate = new Date(sellDate)

    // calculate total days of holding
    const totalDays =
      Math.round((endDate.getTime() - startDate.getTime()) / dayInMs) + 1

    // price step over the total duration (totalDays - 1 intervals)
    const priceDifference = sellPrice - buyPrice
    const priceStep = totalDays > 1 ? priceDifference / (totalDays - 1) : 0

    // dynamic formatter for xAxis
    const formatter = (value: string | number, index?: number) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value)

      const month = date.toLocaleString(undefined, { month: "short" })
      const year = date.getFullYear()
      const displayedYear = date.toLocaleString(undefined, { year: "numeric" })

      // 1. Logic for short durations (Show Month + Day)
      if (totalDays <= 365) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }
      if (totalDays >= 365 * 10) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
        })
      }

      // 2. Logic for long durations (Conditional Year)
      // Always show Year on the first tick
      if (index === 0) {
        return `${month}, ${displayedYear}`
      }

      // Check if this tick's year is different from the previous tick's year
      if (index !== undefined && results[index - 1]) {
        const prevDate = new Date(results[index - 1].date as string)
        const prevYear = prevDate.getFullYear()

        if (year !== prevYear) {
          return `${month}, ${displayedYear}`
        }
      }

      // Default: just show the month
      return month
    }

    // dynamically define x-axis interval for data aggregation
    let newInterval: number

    if (totalDays <= 30) {
      newInterval = dayInMs // Daily for a month
    } else if (totalDays <= 365) {
      newInterval = 7 * dayInMs // Weekly for a year
    } else if (totalDays <= 365 * 2) {
      newInterval = 30 * dayInMs // Monthly for 2 years
    } else if (totalDays <= 365 * 10) {
      newInterval = 30 * 6 * dayInMs // Quarterly for 10 years
    } else if (totalDays <= 365 * 30) {
      newInterval = 365 * 3 * dayInMs // Yearly for 30 years
    } else if (totalDays <= 365 * 50) {
      newInterval = 365 * 6 * dayInMs // Every 2 years for 50 years
    } else {
      // Up to 100 years: Every 5 years
      newInterval = 365 * 20 * dayInMs
    }

    const data: DataRow[] = []

    // create a record with staking rewards date and value for easy lookup
    const rewardsMap = stakingRewards.reduce(
      (acc, entry) => {
        const date = new Date(entry.date).toISOString()
        acc[date] = (acc[date] || 0) + entry.reward
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate daily protocol fees earned
    const dailyFeesEarned = totalDays > 0 ? feesEarned / totalDays : 0

    const investedAda = initialHoldings + buyFees
    const investedUsd = investedAda * buyPrice

    // Start with initial holdings (this is the ADA value of SHEN at purchase)
    let currentHoldings = initialHoldings

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * dayInMs).toISOString()

      // Accumulate staking rewards for this day
      const rewardToday = rewardsMap[d] || 0
      currentHoldings += rewardToday

      // Accumulate protocol fees earned (distributed daily)
      currentHoldings += dailyFeesEarned

      // Calculate ADA price for this day (linear interpolation)
      const priceForDay: number = buyPrice + i * priceStep

      // Current holdings in ADA (without fees deducted)
      const holdingsForDay: number = currentHoldings

      // Holdings after fees (deduct proportional fees)
      const holdingsAfterFees: number = currentHoldings - buyFees

      // USD value at current day's price
      const usdValueForDay: number = holdingsForDay * priceForDay

      data.push({
        date: d,
        ADA: holdingsForDay,
        ADAAfterFees: holdingsAfterFees,
        usdValue: usdValueForDay,
        investedAda,
        investedUsd,
      } as unknown as DataRow)
    }

    // Aggregate the daily data into buckets
    const results = aggregateByBucket(
      data,
      newInterval,
      new Date(data[0].date),
      aggregations,
    )

    const buyTs = startDate.getTime()
    const sellTs = endDate.getTime()
    const priceRange = sellPrice - buyPrice
    const totalRange = sellTs - buyTs

    results.forEach((row) => {
      const adaValue = row.ADA_avg ?? 0
      const rowTs = new Date(row.date).getTime()
      const ratio =
        Number.isFinite(totalRange) && totalRange > 0
          ? Math.min(1, Math.max(0, (rowTs - buyTs) / totalRange))
          : 0
      const priceAtRow = buyPrice + ratio * priceRange
      row.priceAtRow = priceAtRow
      row.buyFees = buyFees
      row.sellFees = sellFees
      row.investedAda = investedAda
      row.investedUsd = investedUsd

      if (!Number.isFinite(row.usdValue_avg)) {
        row.usdValue_avg = (adaValue as number) * priceAtRow
      }
    })

    // Calculate y-axis domain with padding
    const minY = Math.floor((finalHoldings - sellFees) * 0.95)
    const maxY = Math.ceil(Math.max(finalHoldings * 1.05, finalHoldings + 1))

    // Ensure valid y-axis domain
    const finalYDomain: [number, number] =
      minY < maxY ? [minY, maxY] : [0, finalHoldings + 10]

    return { results, yDomain: finalYDomain, xAxisFormater: formatter }
  }, [
    buyDate,
    sellDate,
    initialHoldings,
    finalHoldings,
    buyPrice,
    sellPrice,
    buyFees,
    sellFees,
    feesEarned,
    stakingRewards,
  ])

  const areas = [
    {
      dataKey: "ADA_avg",
      name: "Total ADA Holdings",
      tooltipLabel: "Total Holdings",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "transparent",
      fillOpacity: 0,
      strokeWidth: 2,
    },
    {
      dataKey: "ADAAfterFees_avg",
      name: "ADA After Fees",
      tooltipLabel: "After Fees",
      strokeColor: "var(--color-red-500)",
      fillColor: "transparent",
      fillOpacity: 0,
      strokeWidth: 2,
      strokeDasharray: "5 5",
    },
  ]

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

  // format y-axis ticks as ADA units
  const yTickFormatter = (value: number) => `${formatAxisValue(value)}`

  // formats tooltip to always show ADA holdings and equivalent USD value
  const tooltipFormatter = (
    value: number,
    name: string,
    payload: Record<string, unknown>,
  ) => {
    const safeAda = Number.isFinite(value) ? value : 0
    const priceAtRow = payload.priceAtRow as number
    const usdValue = Number.isFinite(priceAtRow) ? safeAda * priceAtRow : 0

    const safeUsd = Number.isFinite(usdValue) ? usdValue : 0
    const adaFormatted = safeAda.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
    const usdFormatted = safeUsd.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return `₳${adaFormatted} ($${usdFormatted})`
  }

  return (
    <MultiAreaChart
      title="ADA Holdings"
      data={results as DataRow[]}
      xKey="date"
      yDomain={yDomain}
      interval={0}
      areas={areas}
      tickFormatter={yTickFormatter}
      xTickFormatter={xAxisFormater}
      tooltipFormatter={tooltipFormatter}
      height={304}
      margin={{ top: 6, right: 12, left: 12, bottom: 6 }}
    />
  )
}
