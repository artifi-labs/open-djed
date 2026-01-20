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

      // Current holdings in ADA
      const holdingsForDay: number = currentHoldings

      // USD value at current day's price
      const usdValueForDay: number = holdingsForDay * priceForDay

      data.push({
        date: d,
        ADA: holdingsForDay,
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

    // Add point showing initial investment BEFORE buy fees
    results.unshift({
      date: new Date(startDate.getTime() - dayInMs).toISOString(),
      ADA_avg: investedAda,
      usdValue_avg: investedUsd,
      investedAda,
      investedUsd,
    } as unknown as DataRow)

    // Add point showing final value AFTER sell fees
    results.push({
      date: new Date(endDate.getTime() + dayInMs).toISOString(),
      ADA_avg: finalHoldings - sellFees,
      usdValue_avg: (finalHoldings - sellFees) * sellPrice,
      investedAda,
      investedUsd,
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

      const usdBuyFeeValue = buyFees * buyPrice
      const usdSellFeeValue = sellFees * sellPrice

      results.forEach((row) => {
        row.buyFeeValue = buyFees
        row.usdBuyFeeValue = usdBuyFeeValue
        row.sellFeeValue = sellFees
        row.usdSellFeeValue = usdSellFeeValue
        row.investedAda = investedAda
        row.investedUsd = investedUsd
      })
    }

    const buyTs = startDate.getTime()
    const sellTs = endDate.getTime()
    const priceRange = sellPrice - buyPrice
    const totalRange = sellTs - buyTs

    results.forEach((row) => {
      const adaValue =
        row.ADA_avg ?? row.ADA_avg_buy_fees ?? row.ADA_avg_sell_fees ?? 0
      const rowTs = new Date(row.date).getTime()
      const ratio =
        Number.isFinite(totalRange) && totalRange > 0
          ? Math.min(1, Math.max(0, (rowTs - buyTs) / totalRange))
          : 0
      const priceAtRow = buyPrice + ratio * priceRange
      row.priceAtRow = priceAtRow
      if (!Number.isFinite(row.usdValue_avg)) {
        row.usdValue_avg = (adaValue as number) * priceAtRow
      }
    })

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
      tooltipLabel: "Buy Fee",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(--color-supportive-3-500)",
      fillOpacity: 0.1,
    },
    {
      dataKey: "ADA_avg",
      name: "ADA Holdings",
      tooltipLabel: "Earnings",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(--color-supportive-3-500)",
      fillOpacity: 0.1,
      tag: "remove_duplicate_label_on_tooltip",
    },
    {
      dataKey: "ADA_avg_sell_fees",
      name: "Sell Fees",
      tooltipLabel: "Sell Fee",
      strokeColor: "var(--color-supportive-3-500)",
      fillColor: "var(--color-supportive-3-500)",
      fillOpacity: 0.1,
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
    const dataKey = name
    const isBuyFee = dataKey === "ADA_avg_buy_fees"
    const isSellFee = dataKey === "ADA_avg_sell_fees"

    const adaValue = isBuyFee
      ? (payload.buyFeeValue as number)
      : isSellFee
        ? (payload.sellFeeValue as number)
        : value
    const safeAda = Number.isFinite(adaValue) ? adaValue : 0
    const priceAtRow = payload.priceAtRow as number
    const usdValue = isBuyFee
      ? (payload.usdBuyFeeValue as number)
      : isSellFee
        ? (payload.usdSellFeeValue as number)
        : Number.isFinite(priceAtRow)
          ? safeAda * priceAtRow
          : (payload[`usdValue_${aggregations.usdValue[0]}`] as number)

    const safeUsd = Number.isFinite(usdValue) ? usdValue : 0
    const adaFormatted = safeAda.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
    const usdFormatted = safeUsd.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    if (
      name.toLowerCase().includes("ada") ||
      name.toLowerCase().includes("fee")
    ) {
      return `₳${adaFormatted} ($${usdFormatted})`
    }

    return adaFormatted
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
      tooltipFormatter={tooltipFormatter}
      height={304}
      margin={{ top: 6, right: 12, left: 12, bottom: 6 }}
    />
  )
}
