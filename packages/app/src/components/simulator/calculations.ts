"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { registryByNetwork } from "@open-djed/registry"
import { env } from "@/lib/envLoader"
import { Rational } from "@open-djed/math"

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
}

const calculateStakingRewards = (
  amount: number,
  startDate: string,
  endDate: string,
  apy: number = 0.025, //2.5% annual APY
): number => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (isNaN(start) || isNaN(end)) return 0
  const diffInMs = end - start
  if (diffInMs <= 0) return 0

  //One year = 31,536,000,000 ms
  const msPerYear = 1000 * 60 * 60 * 24 * 365
  const yearsHeld = diffInMs / msPerYear
  console.log(yearsHeld)
  return amount * apy * yearsHeld
}

const calculateFeesEarned = (
  amount: number,
  startDate: string,
  endDate: string,
  apy: number = 0.035, //3.5% annual APY
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

    return calculateSimulatorResults(
      inputs,
      new Rational(registry.MintSHENFeePercentage),
      new Rational(registry.BurnSHENFeePercentage),
      new Rational(registry.operatorFeeConfig.percentage),
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
  mintFeeRate: Rational,
  burnFeeRate: Rational,
  operatorFee: Rational,
): ResultsData => {
  const { shenAmount, buyAdaPrice, sellAdaPrice } = inputs //Add buyDate and sellDate after

  const mintRate = mintFeeRate.toNumber()
  const burnRate = burnFeeRate.toNumber()
  const operatorFeeRate = operatorFee.toNumber()

  const buyFee = shenAmount * buyAdaPrice * (mintRate + operatorFeeRate)
  const sellFee = shenAmount * sellAdaPrice * (burnRate + operatorFeeRate)
  const stakingRewards = calculateStakingRewards(
    shenAmount,
    "2025-01-07",
    "2025-02-07",
  )
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
  }
}
