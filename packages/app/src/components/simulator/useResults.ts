"use client"

import { useMemo } from "react"
import { formatNumber, type Value } from "@/lib/utils"
import {
  type ScenarioInputs,
  type ResultsData,
  useSimulatorResults,
} from "./calculations"

export type ResultValueItem = {
  name: string
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
type ToUSDConverter = (value: Value, price: number) => string

interface SectionConfig {
  name: string
  label: string
  isTotal?: boolean
  read: (data: Partial<ResultsData>) => { main: number; sub: number }
  format: (
    main: number,
    sub: number,
    toUSD: ToUSDConverter,
    prices: { buy: number; sell: number },
    isReady: boolean,
  ) => DisplayValue
  className?: string
}

const formatUSDValue = (
  value: number,
  toUSD: ToUSDConverter,
  price: number,
  token: "ADA" | "SHEN",
  isReady: boolean,
  hideSymbolIfZero: boolean,
): string => {
  if (!isReady) return hideSymbolIfZero ? "0" : "$0"
  if (value === 0 && hideSymbolIfZero) return "0"

  return toUSD({ [token]: value }, price)
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
    name: "buyFee",
    label: "Buy Fee",
    read: (d) => ({ main: d.buyFee ?? 0, sub: d.buyFee ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatADALabel(main, isReady),
      formatUSDValue(sub, toUSD, prices.buy, "ADA", isReady, false),
    ],
  },
  {
    name: "sellFee",
    label: "Sell Fee",
    read: (d) => ({ main: d.sellFee ?? 0, sub: d.sellFee ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatSHENLabel(main, isReady),
      formatUSDValue(sub, toUSD, prices.sell, "SHEN", isReady, false),
    ],
  },
  {
    name: "stakingRewards",
    label: "ADA Staking Rewards",
    read: (d) => ({ main: d.stakingRewards ?? 0, sub: d.stakingRewards ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatADALabel(main, isReady),
      formatUSDValue(sub, toUSD, prices.sell, "ADA", isReady, false),
    ],
  },
  {
    name: "feesEarned",
    label: "Buy/Sell Fees Earned",
    read: (d) => ({ main: d.feesEarned ?? 0, sub: d.feesEarned ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatADALabel(main, isReady),
      formatUSDValue(sub, toUSD, prices.sell, "ADA", isReady, false),
    ],
  },
  {
    name: "adaPnl",
    label: "ADA PNL",
    read: (d) => ({ main: d.adaPnl ?? 0, sub: d.adaPnlPercent ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatUSDValue(main, toUSD, prices.sell, "ADA", isReady, true),
      formatPercentValue(sub, isReady),
    ],
  },
  {
    name: "totalPnl",
    label: "Total PNL",
    isTotal: true,
    read: (d) => ({ main: d.totalPnl ?? 0, sub: d.totalPnlPercent ?? 0 }),
    format: (main, sub, toUSD, prices, isReady) => [
      formatUSDValue(main, toUSD, prices.sell, "ADA", isReady, true),
      formatPercentValue(sub, isReady),
    ],
    className:
      "p-12 bg-supportive-2-800 rounded-4 flex flex-row justify-between items-center w-full",
  },
]

export function useResults(inputs: ScenarioInputs) {
  const { results: simulatorData } = useSimulatorResults(inputs)

  return useMemo((): ResultItem[] => {
    const configs = createSectionConfigs()
    const isReady =
      inputs.shenAmount > 0 && inputs.buyAdaPrice > 0 && inputs.sellAdaPrice > 0
    const data = isReady && simulatorData ? simulatorData : {}

    const toUSD: ToUSDConverter = (value: Value, price: number) => {
      const adaAmount = value.ADA ?? 0
      const shenAmount = value.SHEN ?? 0
      const totalAmount = adaAmount + shenAmount
      const usdValue = totalAmount * price
      return `$${formatNumber(usdValue, { maximumFractionDigits: 2 })}`
    }

    const prices = {
      buy: inputs.buyAdaPrice,
      sell: inputs.sellAdaPrice,
    }

    return configs.map((section) => {
      const { main, sub } = section.read(data as Partial<ResultsData>)
      const [top, bottom] = section.format(main, sub, toUSD, prices, isReady)

      return {
        label: section.label,
        values: [
          {
            name: section.name,
            topValue: top,
            bottomValue: bottom,
            isTotal: section.isTotal,
          },
        ],
        className: section.className,
      }
    })
  }, [inputs, simulatorData])
}
