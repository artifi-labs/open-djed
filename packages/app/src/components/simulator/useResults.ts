"use client"

import { useMemo } from "react"
import { formatNumber, type Value, isEmptyValue } from "@/lib/utils"
import {
  type ScenarioInputs,
  type ResultsData,
  useSimulatorResults,
} from "./calculations"

export type ValueItem = {
  name: string
  primaryAmount: string
  secondaryAmount: string
  isTotal?: boolean
  pnlColorClass?: string
  pnlIconName?: "Arrow-Top" | "Arrow-Down"
}

export type ResultItem = {
  label: string
  tooltip: string
  values: ValueItem[]
  className?: string
}

export type Results = {
  totals: ResultItem[]
  details: ResultItem[]
}

type ToUSDConverter = (value: Value, price: number) => string

const formatUSD = (
  toUSD: ToUSDConverter | undefined,
  val: number,
  price: number,
  isReady: boolean,
  hideSymbolIfZero: boolean,
): string => {
  if (!toUSD || !isReady) return "$0.00"
  return toUSD({ ADA: val }, price)
}

const formatPercent = (val: number) =>
  `${formatNumber(Math.abs(val), { maximumFractionDigits: 2 })}%`
const formatADA = (val: number) =>
  `${formatNumber(val, { maximumFractionDigits: 4 })} ADA`
const formatSHEN = (val: number) =>
  `${formatNumber(val, { maximumFractionDigits: 4 })} SHEN`

const createSectionConfigs = () => [
  {
    name: "totalPnl",
    label: "Total PNL",
    tooltip: "Your total profit or loss from buying SHEN, including all fees",
    isTotal: true,
    read: (d: Partial<ResultsData>) => ({
      main: d.totalPnl ?? 0,
      sub: d.totalPnlPercent ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatUSD(toUSD, main, prices.sell, isReady), formatPercent(sub)],
    className: "text-supportive-2-500",
  },
  {
    name: "adaPnl",
    label: "ADA PNL",
    tooltip: "Your profit or loss from buying SHEN expressed in ADA",
    isTotal: true,
    read: (d: Partial<ResultsData>) => ({
      main: d.adaPnl ?? 0,
      sub: d.adaPnlPercent ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatUSD(toUSD, main, prices.sell, isReady), formatPercent(sub)],
    className: "text-supportive-2-500",
  },
  {
    name: "buyFee",
    label: "Buy Fee",
    tooltip:
      "A fee applied when purchasing Djed/Shen. This helps maintain the protocol and is shared with SHEN holders",
    read: (d: Partial<ResultsData>) => ({
      main: d.buyFee ?? 0,
      sub: d.buyFee ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatADA(main), formatUSD(toUSD, sub, prices.buy, isReady)],
  },
  {
    name: "sellFee",
    label: "Sell Fee",
    tooltip:
      "A fee applied when selling Djed/Shen. This helps maintain the protocol and is shared with SHEN holders",
    read: (d: Partial<ResultsData>) => ({
      main: d.sellFee ?? 0,
      sub: d.sellFee ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatSHEN(main), formatUSD(toUSD, sub, prices.sell, isReady)],
  },
  {
    name: "stakingRewards",
    label: "ADA Staking Rewards",
    tooltip:
      "The rewards you earn on the staked ADA backing your SHEN. Staked ADA helps secure the Cardano network and generates passive income",
    read: (d: Partial<ResultsData>) => ({
      main: d.stakingRewards ?? 0,
      sub: d.stakingRewards ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatADA(main), formatUSD(toUSD, sub, prices.sell, isReady)],
    className: "text-primary",
  },
  {
    name: "feesEarned",
    label: "Buy/Sell Fees Earned",
    tooltip:
      "The total fees collected from buy and sell transactions. These are distributed to SHEN Holders. This is the sum of the two above during a given period or projected for a period in the future",
    read: (d: Partial<ResultsData>) => ({
      main: d.feesEarned ?? 0,
      sub: d.feesEarned ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [formatADA(main), formatUSD(toUSD, sub, prices.sell, isReady)],
  },
]

export function useResults(
  inputs: ScenarioInputs,
  priceData?: { to: (v: Value, t: string) => number },
): Results {
  const { results: simulatorData } = useSimulatorResults(inputs)

  return useMemo(() => {
    const configs = createSectionConfigs()
    const isReady =
      !isEmptyValue(inputs.shenAmount) &&
      !isEmptyValue(inputs.buyAdaPrice) &&
      !isEmptyValue(inputs.sellAdaPrice)
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

    const allItems: ResultItem[] = configs.map((section) => {
      const { main, sub } = section.read(data)
      const [primary, secondary] = section.format(
        main,
        sub,
        toUSD,
        prices,
        isReady,
      )
      const isPositive = main >= 0
      const sign = isPositive ? "+" : "-"

      return {
        label: section.label,
        tooltip: section.tooltip,
        className: section.className,
        values: [
          {
            name: section.name,
            primaryAmount: primary,
            secondaryAmount: section.isTotal
              ? `${sign}${secondary}`
              : secondary,
            isTotal: section.isTotal,
            pnlColorClass: isPositive ? "text-success-text" : "text-error-text",
            pnlIconName: isPositive ? "Arrow-Top" : "Arrow-Down",
          },
        ],
      }
    })

    return {
      totals: allItems.filter((item) => item.values[0].isTotal),
      details: allItems.filter((item) => !item.values[0].isTotal),
    }
  }, [inputs, priceData, simulatorData])
}
