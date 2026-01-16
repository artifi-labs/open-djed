"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { expectedStakingReturn, type CreditEntry } from "@/lib/staking"

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
  protocolData: ReturnType<typeof useProtocolData>["data"],
  shenAmount: number,
): number => {
  if (!protocolData || shenAmount <= 0) return 0

  ///1% annual APR
  const feeSharePercent = 0.01

  return protocolData.to({ SHEN: shenAmount * (feeSharePercent / 100) }, "ADA")
}

export function useSimulatorResults(inputs: ScenarioInputs) {
  const { data: protocolData } = useProtocolData()

  const results = React.useMemo(() => {
    if (!protocolData || inputs.shenAmount <= 0) return null
    return calculateSimulatorResults(inputs, protocolData)
  }, [inputs, protocolData])

  return {
    results,
    isLoading: !protocolData,
  }
}

export function calculateSimulatorResults(
  inputs: ScenarioInputs,
  protocolData: ProtocolData,
): ResultsData {
  const { shenAmount, buyDate, sellDate, buyAdaPrice, sellAdaPrice } = inputs

  const buyActionData = protocolData.tokenActionData("SHEN", "Mint", shenAmount)

  const sellActionData = protocolData.tokenActionData(
    "SHEN",
    "Burn",
    shenAmount,
  )
  const buyFeeAda =
    (buyActionData.actionFee.ADA ?? 0) + (buyActionData.operatorFee.ADA ?? 0)

  const sellActionFeeShen = sellActionData.actionFee.SHEN ?? 0
  const sellOperatorFeeAda = sellActionData.operatorFee.ADA ?? 0

  // Convert sell action fee to ADA
  const sellActionFeeAda = protocolData.to({ SHEN: sellActionFeeShen }, "ADA")
  const sellFeeAda = sellActionFeeAda + sellOperatorFeeAda

  const initialAdaHoldings = buyActionData.baseCost.ADA ?? 0

  // Staking rewards
  const stakingInfo = expectedStakingReturn(shenAmount, buyDate, sellDate, {
    aprPercent: 2.5,
  })
  const stakingRewardsAda =
    stakingInfo.totalCreditedRewards + stakingInfo.totalPendingRewards

  const feesEarnedAda = calculateFeesEarned(protocolData, shenAmount)

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
