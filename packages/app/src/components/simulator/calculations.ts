"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { registryByNetwork } from "@open-djed/registry"
import { env } from "@/lib/envLoader"
// import { expectedStakingReturn } from "@/lib/staking"

export interface ScenarioInputs {
  shenAmount: number
  buyDate: string //TODO: update to when calendar component is ready
  sellDate: string //TODO: update to when calendar component is ready
  buyAdaPrice: number
  sellAdaPrice: number
}

export interface ResultsData {
  buyFee: number
  sellFee: number
  stakingRewards: number
  feesEarned: number
  adaPnl: number
  adaPnlPercent: number
  totalPnl: number
  totalPnlPercent: number
  initialAdaHoldings: number
}

const calculateFeesEarned = (
  amount: number,
  startDate: string,
  endDate: string,
  apy: number = 0.01, //1% annual APR
): number => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (isNaN(start) || isNaN(end)) return 0
  const diffInMs = end - start
  if (diffInMs <= 0) return 0

  const msPerYear = 1000 * 60 * 60 * 24 * 365
  return amount * apy * (diffInMs / msPerYear)
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
): ResultsData => {
  const { shenAmount, buyAdaPrice, sellAdaPrice } = inputs

  const buyFee =
    (buyProtocolFees.actionFee + buyProtocolFees.operatorFee) * buyAdaPrice
  const sellFee =
    (sellProtocolFees.actionFee + sellProtocolFees.operatorFee) * sellAdaPrice

  const stakingRewards = 0
  // const stakingInfo = expectedStakingReturn(
  //   shenAmount,
  //   inputs.buyDate || "2025-01-07",
  //   inputs.sellDate || "2025-02-07",
  //   { aprPercent: 2.5 },
  // )
  // const stakingRewards =
  //   stakingInfo.totalCreditedRewards + stakingInfo.totalPendingRewards
  //   console.log("stakingInfo.credits", stakingInfo.credits)
  //   console.log("stakingInfo.totalCreditedRewards", stakingInfo.totalCreditedRewards)
  //   console.log("stakingInfo.totalPendingRewards", stakingInfo.totalPendingRewards)
  //   console.log("stakingRewards", stakingRewards)

  const feesEarned = calculateFeesEarned(shenAmount, "2025-01-07", "2025-02-07")

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
    feesEarned,
    adaPnl,
    adaPnlPercent,
    totalPnl,
    totalPnlPercent,
    initialAdaHoldings,
  }
}
