import { useMemo } from "react"
import { transactionSummaryBuilder } from "./transactionSummaryBuilder"
import { capitalize, formatNumber, formatValue, Value } from "@/lib/utils"
import { useMintBurnAction } from "./useMintBurnAction"

type Action = ReturnType<typeof useMintBurnAction>

type SectionConfig = {
  label: string
  read: (ctx: Action, data: any) => unknown
  default: (ctx: Action) => DisplayValue
}

type DisplayValue = [string, string]

const extractValues = (
  val: unknown,
  toUSD?: (v: Value) => number,
): DisplayValue[] => {
  if (!val || typeof val !== "object") {
    const isFinite = Number.isFinite(val as number)
    return [
      [
        isFinite ? formatValue(val as any) : "$0.00",
        toUSD && isFinite
          ? `$${formatNumber(toUSD(val as Value), { maximumFractionDigits: 2 })}`
          : "$0.00",
      ],
    ]
  }

  return Object.entries(val as Record<string, number>).map(
    ([token, amount]) => {
      const valueObj = { [token]: amount } as Value
      const isFinite = Number.isFinite(amount)
      const usdValue =
        toUSD && isFinite
          ? `$${formatNumber(toUSD(valueObj), { maximumFractionDigits: 2 })}`
          : "$0.00"
      return [isFinite ? formatValue(valueObj) : "$0.00", usdValue]
    },
  )
}

export function useTransactionSummary({ action }: { action: Action }) {
  const { actionData, protocolData, data } = action

  return useMemo(() => {
    const b = transactionSummaryBuilder()

    const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined

    const sections: SectionConfig[] = [
      {
        label: "Base Cost",
        read: (_, d) => d.baseCost,
        default: (ctx) => [
          `0.00 ${ctx.actionType === "Mint" ? ctx.activePayToken : ctx.activeReceiveToken}`,
          "$0.00",
        ],
      },
      {
        label: `${capitalize(action.actionType)} Fee`,
        read: (_, d) => d.actionFee,
        default: (ctx) => [
          `0.00 ${ctx.actionType === "Burn" ? ctx.activePayToken : ctx.activeReceiveToken}`,
          "$0.00",
        ],
      },
      {
        label: "Operator Fee",
        read: (_, d) => d.operatorFee,
        default: () => ["0.00 ADA", "$0.00"],
      },
      {
        label: "Total Cost",
        read: (_, d) => d.totalCost,
        default: (ctx) => [`0.00 ${ctx.activePayToken}`, "$0.00"],
      },
      {
        label: "Refundable Deposit",
        read: (ctx) => ctx.protocolData?.refundableDeposit,
        default: () => ["0.00 ADA", "$0.00"],
      },
      {
        label: "Price",
        read: (_, d) => d.price, // TODO: THIS IS NOT WITH THE RIGHT LABELS
        default: (ctx) => [
          `~0 ADA/${ctx.actionType === "Burn" ? ctx.activePayToken : ctx.activeReceiveToken}`,
          "$0.00",
        ],
      },
    ]

    const empty = !actionData || Object.keys(actionData).length === 0
    const entries = empty ? [] : Object.entries(actionData)

    sections.forEach((section) => {
      let values: DisplayValue[] = []

      if (empty) {
        values = [section.default(action)]
      } else {
        entries.forEach(([, data]) => {
          values.push(...extractValues(section.read(action, data), toUSD))
        })
      }

      if (values.length > 1 && !empty) {
        b.addMulti(section.label, values)
      } else {
        const [top, bottom] = values[0]
        b.addSingle(section.label, top, bottom)
      }
    })

    return b.build()
  }, [action, actionData, data])
}
