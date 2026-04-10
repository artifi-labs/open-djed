import { describe, expect, it } from "vitest"
import { registryByNetwork, type Registry } from "@open-djed/registry"
import type { Token } from "@/types"
import {
  calcMax,
  calcMin,
  calcSuffix,
  computeDualToggleState,
  computeLinkToggleState,
  computeOppositeValues,
  computeTokenChangeSelectedTokens,
  computeValueChange,
  type MintBurnProtocolData,
} from "../useMintBurnAction.utils"

const registry = {
  minAmount: 1_234_567n,
  operatorFeeConfig: {
    max: 1_000_000n,
  },
} as Registry

const protocolData: MintBurnProtocolData = {
  protocolData: {
    DJED: {
      buyPrice: { ADA: 2 },
      mintableAmount: { DJED: 3.4567 },
      burnableAmount: { DJED: 10.1234 },
    },
    SHEN: {
      buyPrice: { ADA: 4 },
      mintableAmount: { SHEN: 8.7654 },
      burnableAmount: { SHEN: 9.8765 },
    },
    refundableDeposit: {
      ADA: 2_000_000,
    },
  },
  to: (values, token) => values[token],
  tokenActionData: (token, actionType, amount) => {
    const toPay =
      actionType === "Burn"
        ? { ADA: token === "DJED" ? amount.amount : amount.amount * 4 }
        : { ADA: token === "DJED" ? amount.amount * 0.5 : amount.amount * 1.5 }

    const toReceive =
      actionType === "Burn"
        ? { ADA: token === "DJED" ? amount.amount : amount.amount * 2 }
        : { ADA: token === "DJED" ? amount.amount * 2 : amount.amount * 3 }

    const baseCost = { [token]: toPay.ADA ?? 0 }
    const actionFee = { ADA: (toPay.ADA ?? 0) * 0.05 }
    const operatorFee = { ADA: 0.1 }
    const totalCost = {
      ADA: (toPay.ADA ?? 0) + (actionFee.ADA ?? 0) + (operatorFee.ADA ?? 0),
    }

    if (actionType === "Burn") {
      return {
        baseCost,
        actionFee,
        actionFeePercentage: 5,
        operatorFee,
        totalCost,
        toPay,
        toReceive,
        price: { ADA: token === "DJED" ? 1 : 2 },
      }
    }

    return {
      baseCost,
      actionFee,
      actionFeePercentage: 5,
      operatorFee,
      totalCost,
      toPay,
      toReceive,
      price: { ADA: token === "DJED" ? 1 : 2 },
    }
  },
}

describe("calcMin", () => {
  it.each([
    ["Preprod", registryByNetwork.Preprod, 0],
    ["Mainnet", registryByNetwork.Mainnet, 50],
  ])(
    "converts lovelace minimum to ADA for %s",
    (_network, networkRegistry, expected) => {
      expect(calcMin(networkRegistry as Registry)).toBe(expected)
    },
  )
})

describe("calcMax", () => {
  it("limits mint max by cap and available ADA", () => {
    const walletBalance = { ADA: 20, DJED: 0, SHEN: 0 }

    expect(calcMax("DJED", "Mint", walletBalance, protocolData, registry)).toBe(
      3.456,
    )
  })

  it("limits burn max by burnable amount", () => {
    const walletBalance = { ADA: 20, DJED: 12.3456, SHEN: 7.89 }

    expect(calcMax("DJED", "Burn", walletBalance, protocolData, registry)).toBe(
      10.123,
    )
  })
})

describe("calcSuffix", () => {
  it("formats the DJED value returned by protocol conversion", () => {
    expect(calcSuffix(protocolData, "DJED", 12.5)).toBe("$12.50")
  })

  it("formats negative values with a minus sign", () => {
    expect(calcSuffix(protocolData, "DJED", -12.5)).toBe("$-12.50")
  })

  it("returns a zero fallback without data", () => {
    expect(calcSuffix(undefined, "DJED", 12.5)).toBe("$0")
  })

  it("formats negative values with a minus sign", () => {
    expect(calcSuffix(undefined, "DJED", -12.5)).toBe("$0")
  })
})

describe("computeOppositeValues", () => {
  it("adds the contribution of each active input instead of overwriting it", () => {
    const sourceAmounts = {
      DJED: 2,
      SHEN: 3,
    } satisfies Partial<Record<Token, number>>

    const { values, actionData } = computeOppositeValues(
      "pay",
      "Burn",
      sourceAmounts,
      ["ADA"],
      protocolData,
    )

    expect(values.ADA).toBe(8)
    expect(actionData.totalCost.ADA).toBe(14.899999999999999)
    expect(actionData.price.ADA?.DJED).toBe(1)
    expect(actionData.price.ADA?.SHEN).toBe(2)
  })

  it("computes the opposite values correctly when minting SHEN", () => {
    const sourceAmounts = {
      SHEN: 3,
    } satisfies Partial<Record<Token, number>>

    const { values, actionData } = computeOppositeValues(
      "pay",
      "Mint",
      sourceAmounts,
      ["ADA"],
      protocolData,
    )

    expect(values.ADA).toBe(4.5)
    expect(actionData.baseCost.SHEN).toBe(4.5)
    expect(actionData.totalCost.ADA).toBe(4.824999999999999)
    expect(actionData.price.ADA?.SHEN).toBe(2)
  })

  it("computes the opposite values correctly when minting DJED", () => {
    const sourceAmounts = {
      DJED: 3,
    } satisfies Partial<Record<Token, number>>

    const { values, actionData } = computeOppositeValues(
      "pay",
      "Mint",
      sourceAmounts,
      ["ADA"],
      protocolData,
    )

    expect(values.ADA).toBe(1.5)
    expect(actionData.baseCost.DJED).toBe(1.5)
    expect(actionData.totalCost.ADA).toBe(1.675)
    expect(actionData.price.ADA?.DJED).toBe(1)
  })
})

describe("computeValueChange", () => {
  it("updates opposite side and actionData for Mint when editing receive", () => {
    const { nextValues, actionData } = computeValueChange(
      "receive",
      "SHEN",
      3,
      "Mint",
      {},
      {
        pay: { isDualSelected: false, isLinkSelected: false },
        receive: { isDualSelected: false, isLinkSelected: false },
      },
      {
        pay: ["ADA"],
        receive: ["DJED", "SHEN"],
      },
      protocolData,
    )

    expect(nextValues.SHEN).toBe(3)
    expect(nextValues.ADA).toBe(4.5)
    expect(actionData?.baseCost.SHEN).toBe(4.5)
    expect(actionData?.price.ADA?.SHEN).toBe(2)
  })

  it("clears opposite values and action data when all source amounts are zero", () => {
    const { nextValues, actionData } = computeValueChange(
      "receive",
      "SHEN",
      0,
      "Mint",
      { DJED: 0, SHEN: 5, ADA: 7.5 },
      {
        pay: { isDualSelected: false, isLinkSelected: false },
        receive: { isDualSelected: true, isLinkSelected: false },
      },
      {
        pay: ["ADA"],
        receive: ["DJED", "SHEN"],
      },
      protocolData,
    )

    expect(nextValues.SHEN).toBe(0)
    expect(nextValues.ADA).toBe(0)
    expect(actionData).toBeNull()
  })

  it("applies linked edits to all source tokens", () => {
    const { nextValues, actionData } = computeValueChange(
      "receive",
      "SHEN",
      2,
      "Mint",
      {},
      {
        pay: { isDualSelected: false, isLinkSelected: false },
        receive: { isDualSelected: true, isLinkSelected: true },
      },
      {
        pay: ["ADA"],
        receive: ["DJED", "SHEN"],
      },
      protocolData,
    )

    expect(nextValues.DJED).toBe(2)
    expect(nextValues.SHEN).toBe(2)
    expect(nextValues.ADA).toBe(4)
    expect(actionData?.baseCost.DJED).toBe(1)
    expect(actionData?.baseCost.SHEN).toBe(3)
    expect(actionData?.price.ADA?.DJED).toBe(1)
    expect(actionData?.price.ADA?.SHEN).toBe(2)
  })

  it("does not break when link is enabled but dual is off", () => {
    const { nextValues } = computeValueChange(
      "pay",
      "DJED",
      5,
      "Mint",
      {},
      {
        pay: { isDualSelected: false, isLinkSelected: true },
        receive: { isDualSelected: false, isLinkSelected: false },
      },
      {
        pay: ["DJED"],
        receive: ["ADA"],
      },
      protocolData,
    )

    expect(nextValues.DJED).toBe(5)
  })
})

describe("Token Change Helper", () => {
  it("keeps selection unchanged when cycling would create duplicates", () => {
    const next = computeTokenChangeSelectedTokens(
      {
        pay: ["DJED", "SHEN"],
        receive: ["ADA"],
      },
      "pay",
      "DJED",
      ["DJED", "SHEN"],
    )

    expect(next.pay).toEqual(["DJED", "SHEN"])
    expect(next.receive).toEqual(["ADA"])
  })

  it("cycles token when no duplicates are produced", () => {
    const next = computeTokenChangeSelectedTokens(
      {
        pay: ["DJED"],
        receive: ["ADA"],
      },
      "pay",
      "DJED",
      ["DJED", "SHEN"],
    )

    expect(next.pay).toEqual(["SHEN"])
    expect(next.receive).toEqual(["ADA"])
  })
})

describe("Dual Toggle Helper", () => {
  it("toggles dual selection and active tokens", () => {
    const tokens: Token[] = ["DJED", "SHEN"]
    const enabled = computeDualToggleState(
      {
        pay: { isDualSelected: false, isLinkSelected: false },
        receive: { isDualSelected: false, isLinkSelected: false },
      },
      {
        pay: ["DJED"],
        receive: ["ADA"],
      },
      "pay",
      tokens,
    )

    expect(enabled.dualState.pay.isDualSelected).toBe(true)
    expect(enabled.selectedTokens.pay).toEqual(["DJED", "SHEN"])

    const disabled = computeDualToggleState(
      enabled.dualState,
      enabled.selectedTokens,
      "pay",
      tokens,
    )

    expect(disabled.dualState.pay.isDualSelected).toBe(false)
    expect(disabled.selectedTokens.pay).toEqual([tokens[0]])
  })

  it("toggles link state only on the targeted section", () => {
    const next = computeLinkToggleState(
      {
        pay: { isDualSelected: false, isLinkSelected: false },
        receive: { isDualSelected: true, isLinkSelected: false },
      },
      "receive",
    )

    expect(next.receive.isLinkSelected).toBe(true)
    expect(next.pay.isLinkSelected).toBe(false)
  })
})
