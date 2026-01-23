"use client"

import { useMemo } from "react"
import {
  formatNumber,
  formatADA,
  formatPercent,
  formatUSDValue,
  isEmptyValue,
  type ToUSDConverter,
  type Value,
} from "@/lib/utils"
import {
  type ScenarioInputs,
  type ResultsData,
  useSimulatorResults,
} from "./calculations"
import { ADA_SIMULATOR_COLOR, SHEN_SIMULATOR_COLOR } from "@/lib/constants"

export type ValueItem = {
  name: string
  primaryAmount: string
  secondaryAmount: string
  isTotal?: boolean
  pnlColorClass?: string
  pnlIconName?: "Arrow-Top" | "Arrow-Down"
  detailsType?: "fee" | "reward"
}

export type ResultItem = {
  label: string
  tooltip: string
  values: ValueItem[]
  className?: string
}

export type Results = {
  totals: ResultItem[]
  feeDetails: ResultItem[]
  rewardDetails: ResultItem[]
}

type SectionConfig = {
  name: string
  label: string
  tooltip: string
  isTotal?: boolean
  read: (d: Partial<ResultsData>) => { main: number; sub: number }
  format: (
    main: number,
    sub: number,
    toUSD: ToUSDConverter,
    prices: { buy: number; sell: number },
    isReady: boolean,
  ) => [string, string]
  className?: string
  detailsType?: "fee" | "reward"
}

const createSectionConfigs: () => SectionConfig[] = () => [
  {
    name: "shenPnl",
    label: "SHEN PNL",
    tooltip:
      "This shows the profit or loss you would make if you invest in SHEN, including fees and rewards.",
    isTotal: true,
    read: (d: Partial<ResultsData>) => ({
      main: d.shenPnl ?? 0,
      sub: d.shenPnlPercent ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      _toUSD: ToUSDConverter,
      _prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [
      isReady
        ? `$${formatNumber(main, { maximumFractionDigits: 2 })}`
        : "$0.00",
      formatPercent(sub),
    ],
    className: `text-${SHEN_SIMULATOR_COLOR}`,
  },
  {
    name: "adaPnl",
    label: "ADA PNL",
    tooltip:
      "This shows the profit or loss you would make by simply holding ADA, without buying SHEN.",
    isTotal: true,
    read: (d: Partial<ResultsData>) => ({
      main: d.adaPnl ?? 0,
      sub: d.adaPnlPercent ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      _toUSD: ToUSDConverter,
      _prices: { buy: number; sell: number },
      isReady: boolean,
    ) => [
      isReady
        ? `$${formatNumber(main, { maximumFractionDigits: 2 })}`
        : "$0.00",
      formatPercent(sub),
    ],
    className: `text-${ADA_SIMULATOR_COLOR}`,
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
    ) => [formatADA(main), formatUSDValue(toUSD, sub, prices.buy, isReady)],
    detailsType: "fee",
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
    ) => [formatADA(main), formatUSDValue(toUSD, sub, prices.sell, isReady)],
    detailsType: "fee",
  },
  {
    name: "totalFees",
    label: "Total Fees",
    tooltip:
      "Total fees applied when buying/selling Djed/Shen. This helps maintain the protocol and is shared with SHEN holders",
    read: (d: Partial<ResultsData>) => ({
      main: d.totalFees ?? 0,
      sub: d.buyFee ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => {
      const formattedAda = formatADA(main)
      if (!toUSD || !isReady) return [formattedAda, "$0.00"]

      // main is total fees in ADA, sub is buy fee in ADA
      // to get sell fee in ADA, we do main - sub
      const sellFeeAda = main - sub
      const sellFeeUsd = toUSD({ ADA: sellFeeAda }, prices.sell)
      const buyFeeUsd = toUSD({ ADA: sub }, prices.buy)
      const totalFeesUsd = `$${formatNumber(
        Number(sellFeeUsd.replace(/[$,]/g, "") || "0") +
          Number(buyFeeUsd.replace(/[$,]/g, "") || "0"),
        { maximumFractionDigits: 2 },
      )}`

      return [formattedAda, totalFeesUsd]
    },
    detailsType: "fee",
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
    ) => [formatADA(main), formatUSDValue(toUSD, sub, prices.sell, isReady)],
    detailsType: "reward",
  },
  {
    name: "feesEarned",
    label: "Buy/Sell Fees Earned",
    tooltip:
      "The total fees collected from buy and sell transactions. These are distributed to SHEN Holders. This is the sum of the buy and sell fees during a given period or projected for a period in the future",
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
    ) => [formatADA(main), formatUSDValue(toUSD, sub, prices.sell, isReady)],
    detailsType: "reward",
  },
  {
    name: "totalRewards",
    label: "Total Rewards",
    tooltip:
      "The sum of the rewards you earn on the staked ADA backing your SHEN and the total fees collected from buy and sell transactions, that are distributed to SHEN Holders.",
    read: (d: Partial<ResultsData>) => ({
      main: d.totalRewards ?? 0,
      sub: d.feesEarned ?? 0,
    }),
    format: (
      main: number,
      sub: number,
      toUSD: ToUSDConverter,
      prices: { buy: number; sell: number },
      isReady: boolean,
    ) => {
      const formattedAda = formatADA(main)
      if (!toUSD || !isReady) return [formattedAda, "$0.00"]

      // main is total rewards in ADA, sub is fees earned in ADA
      // to get staking rewards in ADA, we do main - sub
      const stakingRewardsAda = main - sub
      const stakingRewardsUsd = toUSD({ ADA: stakingRewardsAda }, prices.sell)
      const feesEarnedUsd = toUSD({ ADA: sub }, prices.sell)
      const totalRewardsUsd = `$${formatNumber(
        Number(stakingRewardsUsd.replace(/[$,]/g, "") || "0") +
          Number(feesEarnedUsd.replace(/[$,]/g, "") || "0"),
        { maximumFractionDigits: 2 },
      )}`

      return [formattedAda, totalRewardsUsd]
    },
    detailsType: "reward",
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
      !isEmptyValue(inputs.usdAmount) &&
      !isEmptyValue(inputs.buyAdaPrice) &&
      !isEmptyValue(inputs.sellAdaPrice)
    const data = isReady && simulatorData ? simulatorData : {}

    const toUSD: ToUSDConverter = (value: Value, price: number) => {
      const adaAmount = value.ADA ?? 0
      const usdAmount = value.SHEN ?? 0
      const totalAmount = adaAmount + usdAmount
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
            detailsType: section.detailsType,
          },
        ],
      }
    })

    return {
      totals: allItems.filter((item) => item.values[0].isTotal),
      feeDetails: allItems.filter(
        (item) => item.values[0].detailsType === "fee",
      ),
      rewardDetails: allItems.filter(
        (item) => item.values[0].detailsType === "reward",
      ),
    }
  }, [inputs, priceData, simulatorData])
}
