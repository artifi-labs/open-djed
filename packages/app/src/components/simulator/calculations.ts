"use client"

import * as React from "react"
import { useProtocolData } from "@/hooks/useProtocolData"
import { registryByNetwork } from "@open-djed/registry"
import { env } from "@/lib/envLoader"

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

const rationalToDecimal = (rational: {
  numerator: bigint
  denominator: bigint
}) => {
  return Number(rational.numerator) / Number(rational.denominator)
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
      registry.MintSHENFeePercentage,
      registry.BurnSHENFeePercentage,
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
  mintFeePercent: { numerator: bigint; denominator: bigint },
  burnFeePercent: { numerator: bigint; denominator: bigint },
): ResultsData => {
  const { shenAmount, buyAdaPrice, sellAdaPrice } = inputs

  const mintFeeRate = rationalToDecimal(mintFeePercent)
  const burnFeeRate = rationalToDecimal(burnFeePercent)

  const buyFee = shenAmount * buyAdaPrice * mintFeeRate
  const sellFee = shenAmount * sellAdaPrice * burnFeeRate

  // TODO:
  const stakingRewards = 0
  const feesEarned = 0

  const adaPnl = (sellAdaPrice - buyAdaPrice) * shenAmount
  const adaPnlPercent =
    buyAdaPrice > 0 ? ((sellAdaPrice - buyAdaPrice) / buyAdaPrice) * 100 : 0

  const totalPnl = adaPnl + stakingRewards + feesEarned - (buyFee + sellFee)

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
