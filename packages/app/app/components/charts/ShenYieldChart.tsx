'use client'

import React, { useMemo } from 'react'
import { MultiAreaChart } from './MultiAreaChart'
import type { CreditEntry } from '~/lib/staking'
import { aggregateByBucket, type AggregationConfig, type DataRow } from '~/utils/timeseries'

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
  finalHoldings,
  buyPrice,
  sellPrice,
  buyFees,
  sellFees,
  stakingRewards,
}) => {
  const aggregations: AggregationConfig = {
    ADA: ['avg'],
    usdValue: ['avg'],
  }

  const { results, yDomain } = useMemo(() => {
    if (!buyDate || !sellDate) return { results: [], yDomain: [0, 100] as [number, number] }

    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = new Date(buyDate)
    const endDate = new Date(sellDate)

    // calculate total days of holding
    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / dayInMs) + 1

    // price step over the total duration (totalDays - 1 intervals)
    const priceDifference = sellPrice - buyPrice
    const priceStep = totalDays > 1 ? priceDifference / (totalDays - 1) : 0

    // dynamicaly define x-axys format
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

    let currentHoldings = initialHoldings
    const adaValuesForYAxys: number[] = []

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * dayInMs).toISOString()

      // get date to lookup staking reward for this day
      // if there is a reward accumulate it
      const rewardToday = rewardsMap[d] || 0
      currentHoldings += rewardToday

      const priceForDay: number = buyPrice + i * priceStep
      const holdingsForDay: number = currentHoldings
      const finalUsdValue: number = holdingsForDay * priceForDay

      data.push({
        date: d,
        ADA: holdingsForDay,
        usdValue: finalUsdValue,
      } as unknown as DataRow)

      // store ada holdings for y-axys
      adaValuesForYAxys.push(holdingsForDay)
    }

    const results = aggregateByBucket(data, newInterval, new Date(data[0].date), aggregations)

    results.unshift({
      date: new Date(startDate.getTime() + 1).toISOString(),
      ADA_avg: initialHoldings + buyFees,
      usdValue_avg: (initialHoldings + buyFees) * buyPrice,
    } as unknown as DataRow)

    results.push({
      date: new Date(endDate.getTime() - 1).toISOString(),
      ADA_avg: finalHoldings - sellFees,
      usdValue_avg: finalHoldings * sellPrice,
    } as unknown as DataRow)

    if (results.length > 1) {
      // First element - rename to buy_fees to show in red
      results[0].ADA_avg_buy_fees = results[0].ADA_avg
      delete results[0].ADA_avg

      // Second element - duplicate keys for transition
      results[1].ADA_avg_buy_fees = results[1].ADA_avg
      // Keep results[1].ADA_avg as well

      // Second-to-last element - duplicate keys for transition
      const secondLastIndex = results.length - 2
      results[secondLastIndex].ADA_avg_sell_fees = results[secondLastIndex].ADA_avg
      // Keep results[secondLastIndex].ADA_avg as well

      // Last element - rename to sell_fees to show in red
      const lastIndex = results.length - 1
      results[lastIndex].ADA_avg_sell_fees = results[lastIndex].ADA_avg
      delete results[lastIndex].ADA_avg
    }

    const minY = Math.floor(initialHoldings * 0.95)
    const maxY = Math.ceil(Math.max(finalHoldings * 1.05, finalHoldings + 1))

    // ensure currect y-axys
    const finalYDomain: [number, number] = minY < maxY ? [minY, maxY] : [0, finalHoldings + 10]

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
    stakingRewards,
  ])

  console.log('Results: ', JSON.stringify(results, null, 2))

  const areas = [
    {
      dataKey: 'ADA_avg_buy_fees',
      name: 'Fees',
      tooltipLabel: 'ADA (prior to fees)',
      strokeColor: '#fb2b2b',
      fillColor: '#fb2b2b',
      fillOpacity: 0.8,
      hideOnDuplicate: true,
      tag: 'remove_duplicate_label_on_tooltip',
    },
    {
      dataKey: 'ADA_avg',
      name: 'ADA',
      strokeColor: '#897ECB',
      fillColor: '#897ECB',
      fillOpacity: 0.8,
      tag: 'remove_duplicate_label_on_tooltip',
    },
    {
      dataKey: 'ADA_avg_sell_fees',
      name: 'Fees',
      tooltipLabel: 'ADA (after fees)',
      strokeColor: '#fb2b2b',
      fillColor: '#fb2b2b',
      fillOpacity: 0.8,
      hideOnDuplicate: true,
      tag: 'remove_duplicate_label_on_tooltip',
    },
  ]

  // format y-axis ticks as ADA units
  const yTickFormatter = (value: number) => `₳${value.toFixed(0)}`

  // formats tooltip to always show ADA holdings and equivalent USD value
  const tooltipFormatter = (value: number, name: string, payload: Record<string, unknown>) => {
    const usd = (payload[`usdValue_${aggregations.usdValue[0]}`] as number) ?? 0
    if (name.toLowerCase().includes('ada') || name.toLowerCase().includes('fees')) {
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
