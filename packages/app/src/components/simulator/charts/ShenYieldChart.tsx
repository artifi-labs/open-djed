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
    usdValue: ["avg"],
  }

  const { results, yDomain } = useMemo(() => {
    if (!buyDate || !sellDate || initialHoldings <= 0)
      return { results: [], yDomain: [0, 100] as [number, number] }

    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = new Date(buyDate)
    const endDate = new Date(sellDate)

    // calculate total days of holding
    const totalDays =
      Math.round((endDate.getTime() - startDate.getTime()) / dayInMs) + 1

    // price step over the total duration (totalDays - 1 intervals)
    const priceDifference = sellPrice - buyPrice
    const priceStep = totalDays > 1 ? priceDifference / (totalDays - 1) : 0

    // dynamically define x-axis interval for aggregation
    let newInterval: number

    if (totalDays <= 60) {
      //2 months
      newInterval = 7 * dayInMs
    } else if (totalDays <= 365) {
      //1 year
      newInterval = 30 * dayInMs
    } else if (totalDays <= 730) {
      //2 years
      newInterval = 60 * dayInMs
    } else if (totalDays < 3653) {
      // 10 years
      newInterval = 365 * dayInMs
    } else {
      // over 10 years
      newInterval = 730 * dayInMs
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
      
      // Current holdings in ADA
      const holdingsForDay: number = currentHoldings
      
      // USD value at current day's price
      const usdValueForDay: number = holdingsForDay * priceForDay

      data.push({
        date: d,
        ADA: holdingsForDay,
        usdValue: usdValueForDay,
      } as unknown as DataRow)
    }

    // Aggregate the daily data into buckets
    const results = aggregateByBucket(
      data,
      newInterval,
      new Date(data[0].date),
      aggregations,
    )

    // Add point showing initial investment BEFORE buy fees
    results.unshift({
      date: new Date(startDate.getTime() - dayInMs).toISOString(),
      ADA_avg: initialHoldings + buyFees,
      usdValue_avg: (initialHoldings + buyFees) * buyPrice,
    } as unknown as DataRow)

    // Add point showing final value AFTER sell fees
    results.push({
      date: new Date(endDate.getTime() + dayInMs).toISOString(),
      ADA_avg: finalHoldings - sellFees,
      usdValue_avg: (finalHoldings - sellFees) * sellPrice,
    } as unknown as DataRow)

    if (results.length > 1) {
      // First element - show as buy fees (red area)
      results[0].ADA_avg_buy_fees = results[0].ADA_avg
      delete results[0].ADA_avg

      // Second element - transition from buy fees to holdings
      results[1].ADA_avg_buy_fees = results[1].ADA_avg
      // Keep results[1].ADA_avg as well for smooth transition

      // Second-to-last element - transition from holdings to sell fees
      const secondLastIndex = results.length - 2
      results[secondLastIndex].ADA_avg_sell_fees =
        results[secondLastIndex].ADA_avg
      // Keep results[secondLastIndex].ADA_avg as well for smooth transition

      // Last element - show as sell fees (red area)
      const lastIndex = results.length - 1
      results[lastIndex].ADA_avg_sell_fees = results[lastIndex].ADA_avg
      delete results[lastIndex].ADA_avg
    }

    // Calculate y-axis domain with padding
    const minY = Math.floor((initialHoldings + buyFees) * 0.95)
    const maxY = Math.ceil(Math.max(finalHoldings * 1.05, finalHoldings + 1))

    // Ensure valid y-axis domain
    const finalYDomain: [number, number] =
      minY < maxY ? [minY, maxY] : [0, finalHoldings + 10]

    return { results, yDomain: finalYDomain }
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
      dataKey: "ADA_avg_buy_fees",
      name: "Buy Fees",
      tooltipLabel: "ADA (before buy fees)",
      strokeColor: "#fb2b2b",
      fillColor: "#fb2b2b",
      fillOpacity: 0.8,
      hideOnDuplicate: true,
      tag: "remove_duplicate_label_on_tooltip",
    },
    {
      dataKey: "ADA_avg",
      name: "ADA Holdings",
      tooltipLabel: "ADA Holdings",
      strokeColor: "#897ECB",
      fillColor: "#897ECB",
      fillOpacity: 0.8,
      tag: "remove_duplicate_label_on_tooltip",
    },
    {
      dataKey: "ADA_avg_sell_fees",
      name: "Sell Fees",
      tooltipLabel: "ADA (after sell fees)",
      strokeColor: "#fb2b2b",
      fillColor: "#fb2b2b",
      fillOpacity: 0.8,
      hideOnDuplicate: true,
      tag: "remove_duplicate_label_on_tooltip",
    },
  ]

  // format y-axis ticks as ADA units
  const yTickFormatter = (value: number) => `₳${value.toFixed(0)}`

  // formats tooltip to always show ADA holdings and equivalent USD value
  const tooltipFormatter = (
    value: number,
    name: string,
    payload: Record<string, unknown>,
  ) => {
    const usd = (payload[`usdValue_${aggregations.usdValue[0]}`] as number) ?? 0
    if (name.toLowerCase().includes("ada") || name.toLowerCase().includes("fees")) {
      return `₳${value.toFixed(4)} ($${usd.toFixed(2)})`
    }

    return value.toFixed(4)
  }

  return (
    <MultiAreaChart
      title="ADA Holdings Value Over Time"
      data={results as DataRow[]}
      xKey="date"
      yDomain={yDomain}
      interval={0}
      areas={areas}
      tickFormatter={yTickFormatter}
      tooltipFormatter={tooltipFormatter}
      height={400}
      margin={{ top: 10, right: 40, left: 24, bottom: 10 }}
    />
  )
}