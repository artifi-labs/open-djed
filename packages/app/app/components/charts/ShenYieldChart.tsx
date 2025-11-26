'use client'

import { MultiAreaChart } from './MultiAreaChart'

export const ShenYieldChart = ({
  initialHoldings = 0,
  buyDate,
  sellDate,
  totalPnLUSD = 0,
  totalPnLADA = 0,
  toUSD,
}: {
  initialHoldings?: number
  buyDate: string
  sellDate: string
  totalPnLUSD?: number
  totalPnLADA?: number
  toUSD: ((value: Partial<Record<"DJED" | "SHEN" | "ADA", number>>) => number) | undefined
}) => {
  const buy = new Date(buyDate)
  const sell = new Date(sellDate)
  
  // Generate data points between buy and sell dates
  const data: { name: string; value?: number; usd?: number }[] = []
  const daysDiff = Math.ceil((sell.getTime() - buy.getTime()) / (1000 * 60 * 60 * 24))
  
  const adaToUsdRate = totalPnLADA !== 0 ? totalPnLUSD / totalPnLADA : 0
  const initialUSD = initialHoldings * adaToUsdRate
  
  // Create interpolated values
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(buy.getTime() + i * 24 * 60 * 60 * 1000)
    const dateStr = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`
    
    const progress = i / daysDiff
    const adaValue = initialHoldings + (totalPnLADA * progress)
    const usdValue = initialUSD + (totalPnLUSD * progress)
    
    data.push({
      name: dateStr,
      value: adaValue,
      usd: usdValue, // Store USD for tooltip
    })
  }
  
  // Calculate y-axis domain in ADA with padding
  const finalADA = initialHoldings + totalPnLADA
  const minADA = Math.min(initialHoldings, finalADA)
  const maxADA = Math.max(initialHoldings, finalADA)
  const range = maxADA - minADA || 100
  const yDomain: [number, number] = [
    Math.max(0, minADA - range * 0.1),
    maxADA + range * 0.1
  ]
  
  // Format as ADA for y-axis
  const tickFormatter = (value: number) => `${value.toFixed(0)} ADA`
  
  // Custom tooltip formatter that shows ADA with USD in parentheses
  const tooltipFormatter = (value: number, dataKey: string, payload: any) => {
    const usdValue = payload.usd || 0
    return `${value.toFixed(2)} ADA ($${toUSD ? toUSD(usdValue) : 0})`
  }
  
  // Calculate appropriate interval for x-axis labels
  const interval = Math.max(1, Math.floor(daysDiff / 8))
  
  const areas = [
    { 
      dataKey: 'value', 
      strokeColor: totalPnLADA >= 0 ? '#4ade80' : '#f87171', 
      fillColor: totalPnLADA >= 0 ? '#22c55e' : '#ef4444', 
      fillOpacity: 0.2 
    }
  ]

  return (
    <MultiAreaChart
      tickFormatter={tickFormatter}
      tooltipFormatter={tooltipFormatter}
      yDomain={yDomain}
      interval={interval}
      graphWidth={80}
      xKey="name"
      data={data}
      areas={areas}
    />
  )
}