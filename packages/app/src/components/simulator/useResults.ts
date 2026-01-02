"use client"

import { useMemo } from "react"
import { formatNumber, type Value } from "@/lib/utils"
import {
  calculateSimulatorResults,
  type ScenarioInputs,
  type ResultsData,
} from "./calculations"

export type ResultValueItem = {
  topValue: string
  bottomValue: string
  isTotal?: boolean
}

export type ResultItem = {
  label: string
  values: ResultValueItem[]
  className?: string
}

type DisplayValue = [string, string]
type ToUSDConverter = (value: Value) => number

interface SectionConfig {
  label: string
  isTotal?: boolean
  read: (data: Partial<ResultsData>) => { main: number; sub: number }
  format: (
    main: number,
    sub: number,
    toUSD?: ToUSDConverter,
    isReady?: boolean,
  ) => DisplayValue
  className?: string
}

interface PriceDataProvider {
  to: (value: Value, target: string) => number
}

const formatUSDValue = (
  toUSD: ToUSDConverter | undefined,
  valueObj: Value,
  isReady: boolean,
): string => {
  if (!isReady) return "0"
  if (!toUSD) return "$0.00"

  const usdAmount = toUSD(valueObj)
  return `$${formatNumber(usdAmount, { maximumFractionDigits: 2 })}`
}

const formatPercentValue = (value: number, isReady: boolean): string => {
  if (!isReady) return "0%"
  return `${formatNumber(value, { maximumFractionDigits: 2 })}%`
}

const formatADALabel = (value: number, isReady: boolean): string => {
  if (!isReady) return "0"
  return `${formatNumber(value, { maximumFractionDigits: 4 })} ADA`
}

const formatSHENLabel = (value: number, isReady: boolean): string => {
  if (!isReady) return "0"
  return `${formatNumber(value, { maximumFractionDigits: 4 })} SHEN`
}

const createSectionConfigs = (): SectionConfig[] => [
  {
    label: "Buy Fee",
    read: (d) => ({ main: d.buyFee ?? 0, sub: d.buyFee ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatADALabel(main, isReady ?? false),
      isReady ? formatUSDValue(toUSD, { ADA: sub }, true) : "$0",
    ],
  },
  {
    label: "Sell Fee",
    read: (d) => ({ main: d.sellFee ?? 0, sub: d.sellFee ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatSHENLabel(main, isReady ?? false),
      isReady ? formatUSDValue(toUSD, { SHEN: sub }, true) : "$0",
    ],
  },
  {
    label: "ADA Staking Rewards",
    read: (d) => ({ main: d.stakingRewards ?? 0, sub: d.stakingRewards ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatADALabel(main, isReady ?? false),
      isReady ? formatUSDValue(toUSD, { ADA: sub }, true) : "$0",
    ],
  },
  {
    label: "Buy/Sell Fees Earned",
    read: (d) => ({ main: d.feesEarned ?? 0, sub: d.feesEarned ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatADALabel(main, isReady ?? false),
      isReady ? formatUSDValue(toUSD, { ADA: sub }, true) : "$0",
    ],
  },
  {
    label: "ADA PNL",
    read: (d) => ({ main: d.adaPnl ?? 0, sub: d.adaPnlPercent ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatUSDValue(toUSD, { ADA: main }, isReady ?? false),
      formatPercentValue(sub, isReady ?? false),
    ],
  },
  {
    label: "Total PNL",
    isTotal: true,
    read: (d) => ({ main: d.totalPnl ?? 0, sub: d.totalPnlPercent ?? 0 }),
    format: (main, sub, toUSD, isReady) => [
      formatUSDValue(toUSD, { ADA: main }, isReady ?? false),
      formatPercentValue(sub, isReady ?? false),
    ],
    className:
      "p-12 bg-supportive-2-800 rounded-4 flex flex-row justify-between items-center w-full",
  },
]

export function useResults(
  inputs: ScenarioInputs,
  priceData?: PriceDataProvider,
) {
  return useMemo((): ResultItem[] => {
    const configs = createSectionConfigs()
    const isReady =
      inputs.shenAmount > 0 && inputs.buyAdaPrice > 0 && inputs.sellAdaPrice > 0 //TODO: Add dates conditions
    const data = isReady ? calculateSimulatorResults(inputs) : {}

    const toUSD: ToUSDConverter | undefined = priceData
      ? (value: Value) => priceData.to(value, "DJED")
      : undefined

    return configs.map((section) => {
      const { main, sub } = section.read(data)
      const [top, bottom] = section.format(main, sub, toUSD, isReady)

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
  }, [inputs, priceData])
}
