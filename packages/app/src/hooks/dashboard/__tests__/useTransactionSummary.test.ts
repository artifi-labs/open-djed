import { describe, expect, it } from "vitest"
import {
  buildTransactionSummary,
  type ActionData,
  type TransactionSummaryAction,
} from "../useTransactionSummary"

const t = (key: string) => key

const createAction = (
  overrides: Partial<TransactionSummaryAction> = {},
): TransactionSummaryAction => ({
  actionType: "Mint",
  actionData: null,
  data: undefined,
  tokensStates: {
    pay: { activeTokens: ["ADA"] },
    receive: { activeTokens: ["DJED", "SHEN"] },
  },
  ...overrides,
})

describe("buildTransactionSummary", () => {
  it("returns Mint defaults when actionData is null", () => {
    const summary = buildTransactionSummary({
      action: createAction(),
      translate: t,
    })

    expect(summary.map((item) => item.label)).toEqual([
      "dashboard.baseCost",
      "dashboard.mintFee",
      "dashboard.operatorFee",
      "dashboard.totalCost",
      "dashboard.refundableDeposit",
      "dashboard.price",
    ])

    const price = summary.find((item) => item.label === "dashboard.price")
    expect(price?.values).toEqual([
      { topValue: "~0 ADA/DJED", bottomValue: "$0.00" },
      { topValue: "~0 ADA/SHEN", bottomValue: "$0.00" },
    ])
  })

  it("returns Burn defaults with burn fee label", () => {
    const summary = buildTransactionSummary({
      action: createAction({
        actionType: "Burn",
        tokensStates: {
          pay: { activeTokens: ["DJED", "SHEN"] },
          receive: { activeTokens: ["ADA"] },
        },
      }),
      translate: t,
    })

    const totalCost = summary.find(
      (item) => item.label === "dashboard.totalCost",
    )

    expect(summary.map((item) => item.label)).toEqual([
      "dashboard.baseCost",
      "dashboard.burnFee",
      "dashboard.operatorFee",
      "dashboard.totalCost",
      "dashboard.refundableDeposit",
      "dashboard.price",
    ])

    expect(totalCost?.values).toEqual([
      { topValue: "0.00 ADA", bottomValue: "$0.00" },
      { topValue: "0.00 DJED", bottomValue: "$0.00" },
      { topValue: "0.00 SHEN", bottomValue: "$0.00" },
    ])
  })

  it("formats populated actionData with convertValue", () => {
    const actionData: ActionData = {
      baseCost: { ADA: 2 },
      actionFee: { ADA: 0.5 },
      operatorFee: { ADA: 0.25 },
      totalCost: { ADA: 2.75 },
      refundableDeposit: { ADA: 1 },
      price: { ADA: { DJED: 1.234567 } },
    }

    const summary = buildTransactionSummary({
      action: createAction({ actionData }),
      translate: t,
      convertValue: (value) =>
        (value.ADA ?? 0) + (value.DJED ?? 0) + (value.SHEN ?? 0),
    })

    const baseCost = summary.find((item) => item.label === "dashboard.baseCost")
    const price = summary.find((item) => item.label === "dashboard.price")

    expect(baseCost?.values).toEqual([
      { topValue: "2.00 ADA", bottomValue: "$2.00" },
    ])
    expect(price?.values).toEqual([
      { topValue: "~1.234567 ADA/DJED", bottomValue: "$1.23" },
    ])
  })
})
