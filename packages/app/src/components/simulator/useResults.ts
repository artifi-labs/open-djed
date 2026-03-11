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
import { t, type TFunction } from "i18next"
import { useTranslations } from "next-intl"

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

const createSectionConfigs: (t: TFunction) => SectionConfig[] = () => [
  {
    name: "shenPnl",
    label: t("simulator.results.shen.label"),
    tooltip: t("simulator.results.shen.tooltip"),
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
    className: `text-accent-3`,
  },
  {
    name: "adaPnl",
    label: t("simulator.results.ada.label"),
    tooltip: t("simulator.results.ada.tooltip"),
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
    className: `text-accent-1`,
  },
  {
    name: "buyFee",
    label: t("simulator.results.fees.buyFee.label"),
    tooltip: t("simulator.results.fees.buyFee.tooltip"),
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
    label: t("simulator.results.fees.sellFee.label"),
    tooltip: t("simulator.results.fees.sellFee.tooltip"),
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
    label: t("simulator.results.fees.totalFee.label"),
    tooltip: t("simulator.results.fees.totalFee.tooltip"),
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
    label: t("simulator.results.fees.stakingRewards.label"),
    tooltip: t("simulator.results.fees.stakingRewards.tooltip"),
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
    label: t("simulator.results.fees.earnedFee.label"),
    tooltip: t("simulator.results.fees.earnedFee.tooltip"),
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
    label: t("simulator.results.fees.totalRewards.label"),
    tooltip: t("simulator.results.fees.totalRewards.tooltip"),
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
  const t = useTranslations()

  return useMemo(() => {
    const configs = createSectionConfigs(t)
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
