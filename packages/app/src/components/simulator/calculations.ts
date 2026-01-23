"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { expectedStakingReturn, type CreditEntry } from "@/lib/staking"
import { valueTo } from "@/lib/utils"
import { toAdaUsdExchangeRate } from "@open-djed/math"

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
  stakingCredits: CreditEntry[]
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
  protocolData: ProtocolData,
  oracleDatum: {
    oracleFields: {
      adaUSDExchangeRate: { numerator: bigint; denominator: bigint }
    }
  },
  usdAmount: number,
): number => {
  if (usdAmount <= 0) return 0

  ///1% annual APR
  const feeSharePercent = 0.01

  return valueTo(
    { SHEN: usdAmount * (feeSharePercent / 100) },
    protocolData.poolDatum,
    oracleDatum,
    "ADA",
  )
}

export function useSimulatorResults(inputs: ScenarioInputs) {
  const { data: protocolData } = useProtocolData()

  const results = React.useMemo(() => {
    if (!protocolData || inputs.usdAmount <= 0) {
      return { data: null, error: null }
    }

    try {
      return {
        data: calculateSimulatorResults(inputs, protocolData),
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Invalid ADA price.",
      }
    }
  }, [inputs, protocolData])

  return {
    results: results.data,
    error: results.error,
    isLoading: !protocolData,
  }
}

function calculateSimulatorResults(
  inputs: ScenarioInputs,
  protocolData: ProtocolData,
): ResultsData {
  const { usdAmount, buyDate, sellDate, buyAdaPrice, sellAdaPrice } = inputs
  const { poolDatum } = protocolData

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
    usdAmount,
    { oracleDatum: buyOracleDatum },
  )

  const sellActionData = protocolData.tokenActionData(
    "SHEN",
    "Burn",
    usdAmount,
    { oracleDatum: sellOracleDatum },
  )

  const buyFeeAda =
    (buyActionData.actionFee.ADA ?? 0) + (buyActionData.operatorFee.ADA ?? 0)

  const sellActionFeeShen = sellActionData.actionFee.SHEN ?? 0
  const sellOperatorFeeAda = sellActionData.operatorFee.ADA ?? 0

  const sellActionFeeAda = valueTo(
    { SHEN: sellActionFeeShen },
    poolDatum,
    sellOracleDatum,
    "ADA",
  )
  const sellFeeAda = sellActionFeeAda + sellOperatorFeeAda
  const initialAdaHoldings = buyActionData.baseCost.ADA ?? 0

  // Staking rewards
  const stakingInfo = expectedStakingReturn(usdAmount, buyDate, sellDate, {
    aprPercent: 2.5,
  })
  const stakingRewardsAda =
    stakingInfo.totalCreditedRewards + stakingInfo.totalPendingRewards

  const feesEarnedAda = calculateFeesEarned(
    protocolData,
    sellOracleDatum,
    usdAmount,
  )

  const sellProceedsAda = sellActionData.toReceive.ADA ?? 0
  const finalAdaHoldings =
    sellProceedsAda - sellOperatorFeeAda + stakingRewardsAda + feesEarnedAda

  // ADA PNL in USD - (exclude fees and rewards)
  const adaPurchased = buyAdaPrice > 0 ? usdAmount / buyAdaPrice : 0
  const adaFinalUsdValue = adaPurchased * sellAdaPrice
  const adaPnl = adaFinalUsdValue - usdAmount
  const adaPnlPercent = usdAmount > 0 ? (adaPnl / usdAmount) * 100 : 0

  // SHEN PNL in USD - (includes fees and rewards)
  const finalUsdValue = finalAdaHoldings * sellAdaPrice
  const shenPnl = finalUsdValue - usdAmount
  const shenPnlPercent = usdAmount > 0 ? (shenPnl / usdAmount) * 100 : 0

  const totalFees = buyFeeAda + sellFeeAda
  const totalRewards = stakingRewardsAda + feesEarnedAda

  return {
    buyFee: buyFeeAda,
    sellFee: sellFeeAda,
    totalFees,
    totalRewards,
    stakingRewards: stakingRewardsAda,
    stakingCredits: stakingInfo.credits,
    feesEarned: feesEarnedAda,
    adaPnl,
    adaPnlPercent,
    shenPnl,
    shenPnlPercent,
    initialAdaHoldings,
    finalAdaHoldings,
  }
}
