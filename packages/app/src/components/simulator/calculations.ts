"use client"

import * as React from "react"
import { useApiClient } from "@/context/ApiClientContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { sumValues } from "@/lib/utils"
import { toAdaUsdExchangeRate } from "@open-djed/math"
import { useQuery } from "@tanstack/react-query"

export interface ScenarioInputs {
  usdAmount: number
  buyDate: string
  sellDate: string
  buyAdaPrice: number
  sellAdaPrice: number
}

export interface ResultsData {
  buyFee: number
  sellFee: number
  totalFees: number
  stakingRewards: number
  feesEarned: number
  totalRewards: number
  adaPnl: number
  adaPnlPercent: number
  shenPnl: number
  shenPnlPercent: number
  initialAdaHoldings: number
  finalAdaHoldings: number
}

type ProtocolData = NonNullable<ReturnType<typeof useProtocolData>["data"]>

const calculateFeesEarned = (
  initialAdaHoldings: number,
  feesEarningsRate: number,
): number => {
  if (initialAdaHoldings <= 0 || feesEarningsRate <= 0) return 0
  return initialAdaHoldings * feesEarningsRate
}

export function useSimulatorResults(inputs: ScenarioInputs) {
  const client = useApiClient()
  const { data: protocolData } = useProtocolData()
  const hasDateRange = Boolean(inputs.buyDate && inputs.sellDate)
  const stakingRewardsRateQuery = useQuery({
    queryKey: [
      "simulator-historical-staking-rewards",
      inputs.buyDate,
      inputs.sellDate,
    ],
    enabled: hasDateRange,
    queryFn: async () => {
      const res = await client.api["historical-staking-rewards"].$get({
        query: {
          startDate: inputs.buyDate,
          endDate: inputs.sellDate,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch staking rewards.")

      const data = await res.json()
      return Number(data ?? 0)
    },
  })
  const stakingRewardsRate = stakingRewardsRateQuery.data ?? 0
  const feesEarningsRateQuery = useQuery({
    queryKey: [
      "simulator-historical-fees-earnings",
      inputs.buyDate,
      inputs.sellDate,
    ],
    enabled: hasDateRange,
    queryFn: async () => {
      const res = await client.api["historical-fees-earnings"].$get({
        query: {
          startDate: inputs.buyDate,
          endDate: inputs.sellDate,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch fees earnings.")

      const data = await res.json()
      return Number(data ?? 0)
    },
  })
  const feesEarningsRate = feesEarningsRateQuery.data ?? 0

  const results = React.useMemo(() => {
    if (!protocolData || inputs.usdAmount <= 0 || !hasDateRange) {
      return { data: null, error: null }
    }

    try {
      return {
        data: calculateSimulatorResults(
          inputs,
          protocolData,
          stakingRewardsRate,
          feesEarningsRate,
        ),
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Invalid ADA price.",
      }
    }
  }, [hasDateRange, inputs, protocolData, stakingRewardsRate, feesEarningsRate])

  return {
    results: results.data,
    error: results.error,
    isLoading:
      !protocolData ||
      (hasDateRange &&
        (stakingRewardsRateQuery.isLoading || feesEarningsRateQuery.isLoading)),
  }
}

function calculateSimulatorResults(
  inputs: ScenarioInputs,
  protocolData: ProtocolData,
  stakingRewardsRate: number,
  feesEarningsRate: number,
): ResultsData {
  const { usdAmount, buyAdaPrice, sellAdaPrice } = inputs

  // Build a new oracle datum using a user-provided ADA/USD price.
  const newOracleDatum = (adaUsd: number): ProtocolData["oracleDatum"] => {
    if (!Number.isFinite(adaUsd) || adaUsd <= 0) {
      throw new Error("ADA price must be greater than 0.")
    }

    const adaUsdExchangeRate = toAdaUsdExchangeRate(adaUsd)

    return {
      oracleFields: {
        adaUSDExchangeRate: adaUsdExchangeRate,
      },
    }
  }

  const buyOracleDatum = newOracleDatum(buyAdaPrice)
  const sellOracleDatum = newOracleDatum(sellAdaPrice)

  const buyActionData = protocolData.tokenActionData(
    "SHEN",
    "Mint",
    { type: "In", amount: protocolData.to({ DJED: usdAmount }, "SHEN") },
    { oracleDatum: buyOracleDatum },
  )

  const buyFeeAda = protocolData.to(
    sumValues(buyActionData.actionFee, buyActionData.operatorFee),
    "ADA",
  )

  const initialAdaHoldings = buyActionData.baseCost.ADA ?? 0
  const stakingRewardsAda = initialAdaHoldings * stakingRewardsRate

  const feesEarnedAda = calculateFeesEarned(
    initialAdaHoldings,
    feesEarningsRate,
  )

  const sellActionData = protocolData.tokenActionData(
    "SHEN",
    "Burn",
    {
      type: "In",
      amount:
        (buyActionData.toReceive.SHEN ?? 0) +
        protocolData.to({ ADA: feesEarnedAda }, "SHEN"),
    },
    { oracleDatum: sellOracleDatum },
  )

  const sellFeeAda = protocolData.to(
    sumValues(sellActionData.actionFee, sellActionData.operatorFee),
    "ADA",
    { oracleDatum: sellOracleDatum },
  )

  const finalAdaHoldings =
    (sellActionData.toReceive.ADA ?? 0) + stakingRewardsAda

  // ADA PNL in USD - (exclude fees and rewards)
  const adaPurchased = buyAdaPrice > 0 ? usdAmount / buyAdaPrice : 0
  const adaFinalUsdValue = adaPurchased * sellAdaPrice
  const adaPnl = adaFinalUsdValue - usdAmount

  // SHEN PNL in USD - (includes fees and rewards)
  const finalUsdValue = finalAdaHoldings * sellAdaPrice
  const shenPnl = finalUsdValue - usdAmount

  return {
    buyFee: buyFeeAda,
    sellFee: sellFeeAda,
    totalFees: buyFeeAda + sellFeeAda,
    totalRewards: stakingRewardsAda + feesEarnedAda,
    stakingRewards: stakingRewardsAda,
    feesEarned: feesEarnedAda,
    adaPnl,
    adaPnlPercent: usdAmount > 0 ? (adaPnl / usdAmount) * 100 : 0,
    shenPnl,
    shenPnlPercent: usdAmount > 0 ? (shenPnl / usdAmount) * 100 : 0,
    initialAdaHoldings,
    finalAdaHoldings,
  }
}
