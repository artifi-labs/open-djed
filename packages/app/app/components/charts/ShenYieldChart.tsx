'use client'

import { MultiAreaChart } from './MultiAreaChart'

export const ShenYieldChart = () => {
  const yDomain: [number, number] = [0, 12]
  const tickFormatter = (value: number) => `${value}\u00A0%`
  const interval: number = 2
  const data: { name: string; value?: number }[] = [
    { name: '07/07', value: 0 },
    { name: '07/08' },
    { name: '07/09' },
    { name: '07/10' },
    { name: '07/11' },
    { name: '07/12' },
    { name: '07/13' },
    { name: '07/14' },
    { name: '07/15' },
    { name: '07/16' },
    { name: '07/17', value: 7 },
    { name: '07/18' },
    { name: '07/19' },
    { name: '07/20' },
    { name: '07/21', value: 5.5 },
    { name: '07/22' },
    { name: '07/23' },
    { name: '07/24' },
    { name: '07/25', value: 6.9 },
    { name: '07/26' },
    { name: '07/27' },
    { name: '07/28' },
    { name: '07/29' },
    { name: '07/30' },
    { name: '07/31' },
    { name: '08/01', value: 6.8 },
    { name: '08/02' },
    { name: '08/03' },
    { name: '08/04' },
    { name: '08/05' },
    { name: '08/06', value: 9 },
  ]
  const areas = [{ dataKey: 'value', strokeColor: '#4885c7', fillColor: '#305a87', fillOpacity: 0.2 }]

  return (
    <MultiAreaChart
      tickFormatter={tickFormatter}
      yDomain={yDomain}
      interval={interval}
      graphWidth={20}
      xKey="name"
      data={data}
      areas={areas}
    />
  )
}
