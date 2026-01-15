"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { registryByNetwork } from "@open-djed/registry"
import { env } from "@/lib/envLoader"
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

// const MIN_FEES_SHARE_PERCENT = 2
// const MAX_FEES_SHARE_PERCENT = 3

const calculateFeesEarned = (
  protocolData: ReturnType<typeof useProtocolData>["data"],
  shenAmount: number,
): number => {
  if (!protocolData || shenAmount <= 0) return 0

  // Random entre 2% e 3%
  // const feeSharePercent =
  //   Math.random() * (MAX_FEES_SHARE_PERCENT - MIN_FEES_SHARE_PERCENT) +
  //   MIN_FEES_SHARE_PERCENT

  ///1% annual APR
  const feeSharePercent = 0.1

  return protocolData.to({ SHEN: shenAmount * (feeSharePercent / 100) }, "ADA")
}

export function useSimulatorResults(inputs: ScenarioInputs) {
  const { data: protocolData } = useProtocolData()
  const { NETWORK } = env
  const registry = registryByNetwork[NETWORK]

  const results = React.useMemo(() => {
    if (!protocolData || inputs.shenAmount <= 0 || !registry) {
      return null
    }

    const buyActionData = protocolData.tokenActionData(
      "SHEN",
      "Mint",
      inputs.shenAmount,
    )
    const sellActionData = protocolData.tokenActionData(
      "SHEN",
      "Burn",
      inputs.shenAmount,
    )

    const buyProtocolFees = {
      actionFee: buyActionData.actionFee.ADA ?? 0,
      operatorFee: buyActionData.operatorFee.ADA ?? 0,
    }

    const sellProtocolFees = {
      actionFee: sellActionData.actionFee.ADA ?? 0,
      operatorFee: sellActionData.operatorFee.ADA ?? 0,
    }
    const initialAdaHoldings = protocolData.to(
      { SHEN: inputs.shenAmount },
      "ADA",
    )

    return calculateSimulatorResults(
      inputs,
      initialAdaHoldings,
      buyProtocolFees,
      sellProtocolFees,
      protocolData,
    )
  }, [inputs, protocolData, registry])

  return {
    results,
    isLoading: !protocolData,
    registry,
  }
}

export const calculateSimulatorResults = (
  inputs: ScenarioInputs,
  initialAdaHoldings: number,
  buyProtocolFees: { actionFee: number; operatorFee: number },
  sellProtocolFees: { actionFee: number; operatorFee: number },
  protocolData: ReturnType<typeof useProtocolData>["data"],
): ResultsData => {
  const { shenAmount, buyAdaPrice, sellAdaPrice } = inputs

  //Paid fees
  const buyFee =
    (buyProtocolFees.actionFee + buyProtocolFees.operatorFee) * buyAdaPrice
  const sellFee =
    (sellProtocolFees.actionFee + sellProtocolFees.operatorFee) * sellAdaPrice

  //Staking
  const stakingInfo = expectedStakingReturn(
    shenAmount,
    inputs.buyDate,
    inputs.sellDate,
    { aprPercent: 2.5 },
  )
  const stakingRewards =
    stakingInfo.totalCreditedRewards + stakingInfo.totalPendingRewards

  //Fees earned
  const feesEarned = calculateFeesEarned(protocolData, shenAmount)

  const finalAdaHoldings = initialAdaHoldings + stakingRewards + feesEarned

  //ADA PNL
  const adaPnl = (sellAdaPrice - buyAdaPrice) * shenAmount
  const adaPnlPercent =
    buyAdaPrice > 0 ? ((sellAdaPrice - buyAdaPrice) / buyAdaPrice) * 100 : 0

  //Total PNL
  const totalPnl =
    adaPnl + (stakingRewards + feesEarned) * sellAdaPrice - (buyFee + sellFee)
  const investment = shenAmount * buyAdaPrice + buyFee
  const totalPnlPercent = investment > 0 ? (totalPnl / investment) * 100 : 0

  return {
    buyFee,
    sellFee,
    stakingRewards,
    stakingCredits: stakingInfo.credits,
    feesEarned,
    adaPnl,
    adaPnlPercent,
    totalPnl,
    totalPnlPercent,
    initialAdaHoldings,
    finalAdaHoldings,
  }
}
