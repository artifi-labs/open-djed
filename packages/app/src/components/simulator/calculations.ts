"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { expectedStakingReturn, type CreditEntry } from "@/lib/staking"
import { valueTo } from "@/lib/utils"

export interface ScenarioInputs {
  shenAmount: number
  buyDate: string
  sellDate: string
  buyAdaPrice: number
  sellAdaPrice: number
}

export interface ResultsData {
  buyFee: number
  sellFee: number
  stakingRewards: number
  stakingCredits: CreditEntry[]
  feesEarned: number
  adaPnl: number
  adaPnlPercent: number
  totalPnl: number
  totalPnlPercent: number
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
  shenAmount: number,
): number => {
  if (shenAmount <= 0) return 0

  ///1% annual APR
  const feeSharePercent = 0.01

  return valueTo(
    { SHEN: shenAmount * (feeSharePercent / 100) },
    protocolData.poolDatum,
    oracleDatum,
    "ADA",
  )
}

export function useSimulatorResults(inputs: ScenarioInputs) {
  const { data: protocolData } = useProtocolData()

  const results = React.useMemo(() => {
    if (!protocolData || inputs.shenAmount <= 0) {
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

export function calculateSimulatorResults(
  inputs: ScenarioInputs,
  protocolData: ProtocolData,
): ResultsData {
  const { shenAmount, buyDate, sellDate, buyAdaPrice, sellAdaPrice } = inputs
  const { poolDatum } = protocolData

  const toAdaUsdExchangeRate = (adaUsd: number) => {
    if (!Number.isFinite(adaUsd) || adaUsd <= 0) return null
    const scaled = Math.round(adaUsd * 1_000_000)
    return { numerator: BigInt(scaled), denominator: 1_000_000n }
  }

  // Build a new oracle datum using a user-provided ADA/USD price.
  const newOracleDatum = (adaUsd: number): ProtocolData["oracleDatum"] => {
    const adaUsdExchangeRate = toAdaUsdExchangeRate(adaUsd)
    if (!adaUsdExchangeRate) {
      throw new Error("ADA price must be greater than 0.")
    }

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
    shenAmount,
    { oracleDatum: buyOracleDatum },
  )

  const sellActionData = protocolData.tokenActionData(
    "SHEN",
    "Burn",
    shenAmount,
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
  const stakingInfo = expectedStakingReturn(shenAmount, buyDate, sellDate, {
    aprPercent: 2.5,
  })
  const stakingRewardsAda =
    stakingInfo.totalCreditedRewards + stakingInfo.totalPendingRewards

  const feesEarnedAda = calculateFeesEarned(
    protocolData,
    sellOracleDatum,
    shenAmount,
  )

  const sellProceedsAda = sellActionData.toReceive.ADA ?? 0
  const finalAdaHoldings =
    sellProceedsAda - sellOperatorFeeAda + stakingRewardsAda + feesEarnedAda

  // PNL in ADA
  const investmentAda = initialAdaHoldings + buyFeeAda
  const adaPnl = finalAdaHoldings - investmentAda
  const adaPnlPercent = investmentAda > 0 ? (adaPnl / investmentAda) * 100 : 0

  // Total PNL
  const finalUsdValue = finalAdaHoldings * sellAdaPrice
  const investmentUsd = investmentAda * buyAdaPrice
  const totalPnl = finalUsdValue - investmentUsd
  const totalPnlPercent =
    investmentUsd > 0 ? (totalPnl / investmentUsd) * 100 : 0

  return {
    buyFee: buyFeeAda,
    sellFee: sellFeeAda,
    stakingRewards: stakingRewardsAda,
    stakingCredits: stakingInfo.credits,
    feesEarned: feesEarnedAda,
    adaPnl,
    adaPnlPercent,
    totalPnl,
    totalPnlPercent,
    initialAdaHoldings,
    finalAdaHoldings,
  }
}
