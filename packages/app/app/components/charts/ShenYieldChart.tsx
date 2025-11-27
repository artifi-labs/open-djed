'use client'

import React, { useMemo } from 'react'
import { MultiAreaChart } from './MultiAreaChart'
import type { CreditEntry } from '~/lib/staking'

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
  const {
    data,
    yDomain,
    interval: dynamicInterval,
  } = useMemo(() => {
    if (!buyDate || !sellDate) return { data: [], yDomain: [0, 100] as [number, number], interval: 3 }

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
    let dateFormat: Intl.DateTimeFormatOptions

    if (totalDays <= 60) {
      //2 months
      newInterval = 7
      dateFormat = { month: '2-digit', day: '2-digit' }
    } else if (totalDays <= 365) {
      //1 year
      newInterval = 30
      dateFormat = { month: '2-digit', day: '2-digit' }
    } else if (totalDays <= 730) {
      //2 years
      newInterval = 60
      dateFormat = { month: '2-digit', day: '2-digit', year: '2-digit' }
    } else if (totalDays < 3653) {
      // 10 years
      newInterval = 365
      dateFormat = { year: 'numeric' }
    } else {
      // over 10 years
      newInterval = 730
      dateFormat = { year: 'numeric' }
    }

    const data: { date: string; ADA: number; usdValue: number }[] = []
    data.push({
      date: startDate.toLocaleDateString('en-US', dateFormat),
      ADA: initialHoldings + buyFees, // show the difference the fees cause
      usdValue: (initialHoldings + buyFees) * buyPrice,
    })

    // create a record with staking rewards date and value for easy lookup
    const rewardsMap = stakingRewards.reduce(
      (acc, entry) => {
        const date = new Date(entry.date).toLocaleDateString('en-US', dateFormat).substring(0, 10)
        acc[date] = (acc[date] || 0) + entry.reward
        return acc
      },
      {} as Record<string, number>,
    )

    let currentHoldings = initialHoldings
    const adaValuesForYAxys: number[] = []

    for (let i = 1; i < totalDays - 1; i++) {
      const d = new Date(startDate.getTime() + i * dayInMs)
      const dateKey = d.toLocaleDateString('en-US', dateFormat)

      // get date to lookup staking reward for this day
      // if there is a reward accumulate it
      const rewardLookupKey = d.toLocaleDateString('en-US', dateFormat).substring(0, 10)
      const rewardToday = rewardsMap[rewardLookupKey] || 0
      currentHoldings += rewardToday

      const priceForDay: number = buyPrice + i * priceStep
      const holdingsForDay: number = currentHoldings
      const finalUsdValue: number = holdingsForDay * priceForDay

      data.push({
        date: dateKey,
        ADA: holdingsForDay,
        usdValue: finalUsdValue,
      })
      // store ada holdings for y-axys
      adaValuesForYAxys.push(holdingsForDay)
    }

    data.push({
      date: endDate.toLocaleDateString('en-US', dateFormat),
      ADA: finalHoldings,
      usdValue: finalHoldings * sellPrice,
    })

    // add a 5% buffer to the y-axys to add a padding
    const minY = Math.floor(initialHoldings * 0.95)
    const maxY = Math.ceil(Math.max(finalHoldings * 1.05, finalHoldings + 1))

    // ensure currect y-axys
    const finalYDomain: [number, number] = minY < maxY ? [minY, maxY] : [0, finalHoldings + 10]

    return { data, yDomain: finalYDomain, interval: newInterval }
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

  const areas = [
    {
      dataKey: 'ADA',
      strokeColor: '#897ECB',
      fillColor: '#897ECB',
      fillOpacity: 0.8,
    },
  ]

  // format y-axis ticks as ADA units
  const yTickFormatter = (value: number) => `₳${value.toFixed(0)}`

  // format the tooltip to show the ADA holdings
  const tooltipFormatter = (value: number, dataKey: string, payload: Record<string, unknown>) => {
    if (dataKey === 'ADA') {
      const usd = (payload.usdValue as number) ?? 0
      return `₳${value.toFixed(4)} ($${usd.toFixed(2)})`
    }

    return value.toFixed(4)
  }

  return (
    <MultiAreaChart
      title="ADA Holdings Value Over Time"
      data={data}
      xKey="date"
      yDomain={yDomain}
      interval={dynamicInterval}
      areas={areas}
      tickFormatter={yTickFormatter}
      tooltipFormatter={tooltipFormatter}
      height={400}
    />
  )
}
