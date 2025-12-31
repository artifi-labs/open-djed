"use client"

import { useMemo } from "react"
import { formatNumber, type Value } from "@/lib/utils"

export type ResultValueItem = {
  topValue: string
  bottomValue: string
  isTotal?: boolean
}

export type ResultItem = {
  label: string
  values: ResultValueItem[]
}

interface ResultsData {
  buyFee: number
  sellFee: number
  stakingRewards: number
  feesEarned: number
  adaPnl: number
  adaPnlPercent: number
  totalPnl: number
  totalPnlPercent: number
}

type DisplayValue = [string, string]
type ToUSDConverter = (value: Value) => number

interface SectionConfig {
  label: string
  isTotal?: boolean
  read: (data: Partial<ResultsData>) => { main: number; sub: number }
  format: (main: number, sub: number, toUSD?: ToUSDConverter) => DisplayValue
  className?: string
}
interface PriceDataProvider {
  to: (value: Value, target: string) => number
}

const formatUSDValue = (
  toUSD: ToUSDConverter | undefined,
  valueObj: Value,
): string => {
  if (!toUSD) {
    return "$0.00"
  }
  const usdAmount = toUSD(valueObj)
  return `$${formatNumber(usdAmount, { maximumFractionDigits: 2 })}`
}

const formatPercentValue = (value: number): string => {
  return `${formatNumber(value, { maximumFractionDigits: 2 })}%`
}

const formatADALabel = (value: number): string => {
  return `${formatNumber(value, { maximumFractionDigits: 4 })} ADA`
}

const createSectionConfigs = (): SectionConfig[] => [
  {
    label: "Buy Fee",
    read: (d) => ({ main: d.buyFee ?? 0, sub: d.buyFee ?? 0 }),
    format: (main, sub, toUSD) => [
      formatADALabel(main),
      formatUSDValue(toUSD, { ADA: sub }),
    ],
  },
  {
    label: "Sell Fee",
    read: (d) => ({ main: d.sellFee ?? 0, sub: d.sellFee ?? 0 }),
    format: (main, sub, toUSD) => [
      formatADALabel(main),
      formatUSDValue(toUSD, { ADA: sub }),
    ],
  },
  {
    label: "ADA Staking Rewards",
    read: (d) => ({ main: d.stakingRewards ?? 0, sub: d.stakingRewards ?? 0 }),
    format: (main, sub, toUSD) => [
      formatADALabel(main),
      formatUSDValue(toUSD, { ADA: sub }),
    ],
  },
  {
    label: "Buy/Sell Fees Earned",
    read: (d) => ({ main: d.feesEarned ?? 0, sub: d.feesEarned ?? 0 }),
    format: (main, sub, toUSD) => [
      formatADALabel(main),
      formatUSDValue(toUSD, { ADA: sub }),
    ],
  },
  {
    label: "ADA PNL",
    read: (d) => ({ main: d.adaPnl ?? 0, sub: d.adaPnlPercent ?? 0 }),
    format: (main, sub, toUSD) => [
      formatUSDValue(toUSD, { ADA: main }),
      formatPercentValue(sub),
    ],
  },
  {
    label: "Total PNL",
    isTotal: true,
    read: (d) => ({ main: d.totalPnl ?? 0, sub: d.totalPnlPercent ?? 0 }),
    format: (main, sub, toUSD) => [
      formatUSDValue(toUSD, { ADA: main }),
      formatPercentValue(sub),
    ],
    className:
      "p-12 bg-supportive-2-800 rounded-4 flex flex-row justify-between items-center w-full",
  },
]

export function useResults(
  data: Partial<ResultsData> | undefined,
  priceData?: PriceDataProvider,
) {
  return useMemo((): ResultItem[] => {
    const configs = createSectionConfigs()
    const safeData = data ?? {}

    const toUSD: ToUSDConverter | undefined = priceData
      ? (value: Value) => priceData.to(value, "DJED")
      : undefined

    return configs.map((section) => {
      const { main, sub } = section.read(safeData)
      const [top, bottom] = section.format(main, sub, toUSD)

      return {
        label: section.label,
        values: [
          {
            topValue: top,
            bottomValue: bottom,
            isTotal: section.isTotal,
          },
        ],
        className: section.className,
      }
    })
  }, [data, priceData])
}
