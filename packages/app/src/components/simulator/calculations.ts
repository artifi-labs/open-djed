import { type Value } from "@/lib/utils"

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

export const calculateSimulatorResults = (
  inputs: ScenarioInputs,
): ResultsData => {
  const { shenAmount, buyAdaPrice, sellAdaPrice } = inputs
  //TODO: calculations logic

  return {
    buyFee: 1,
    sellFee: 1,
    stakingRewards: 1,
    feesEarned: 1,
    adaPnl: 1,
    adaPnlPercent: 1,
    totalPnl: 1,
    totalPnlPercent: 1,
  }
}
