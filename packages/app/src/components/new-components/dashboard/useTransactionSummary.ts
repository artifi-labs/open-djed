import { useMemo } from "react"
import { transactionSummaryBuilder } from "./transactionSummaryBuilder"
import { capitalize, formatNumber, formatValue, type Value } from "@/lib/utils"
import { type useMintBurnAction } from "./useMintBurnAction"
import type { Token } from "@/lib/tokens"

type Action = ReturnType<typeof useMintBurnAction>
type DisplayValue = [string, string]
type ToUSDConverter = (value: Value) => number
type ActionData = NonNullable<Action["actionData"][Token]>

interface SectionConfig {
  label: string
  read: (action: Action, data: ActionData) => unknown
  default: (action: Action) => DisplayValue | DisplayValue[]
}

const normalizeToArray = (
  value: DisplayValue | DisplayValue[],
): DisplayValue[] => {
  if (Array.isArray(value[0])) {
    return value as DisplayValue[]
  }
  return [value as DisplayValue]
}

const ZERO_DISPLAY: DisplayValue = ["$0.00", "$0.00"]

const formatUSDValue = (
  toUSD: ToUSDConverter | undefined,
  valueObj: Value,
): string => {
  if (!toUSD) {
    return "$0.00"
  }
  const usdAmount = toUSD(valueObj)
  return `${formatNumber(usdAmount, { maximumFractionDigits: 2 })}`
}

const formatSingleValue = (
  value: number,
  toUSD?: ToUSDConverter,
): DisplayValue => {
  const isValid = Number.isFinite(value)
  if (!isValid) {
    return ["$0.00", "$0.00"]
  }

  const formatted = formatNumber(value, { maximumFractionDigits: 4 })
  const usdValue = toUSD ? formatUSDValue(toUSD, value as Value) : "$0.00"
  return [formatted, usdValue]
}

const formatTokenValue = (
  token: string,
  amount: number,
  toUSD?: ToUSDConverter,
): DisplayValue => {
  const isValid = Number.isFinite(amount)
  if (!isValid) {
    return ["$0.00", "$0.00"]
  }

  const valueObj = { [token]: amount }
  const formatted = formatValue(valueObj)
  const usdValue = toUSD ? formatUSDValue(toUSD, valueObj) : "$0.00"
  return [formatted, usdValue]
}

const extractDisplayValues = (
  value: Value,
  toUSD?: ToUSDConverter,
): DisplayValue[] => {
  if (!value || typeof value !== "object") {
    return [formatSingleValue(value as number, toUSD)]
  }

  return Object.entries(value as Record<string, number>).map(
    ([token, amount]) => formatTokenValue(token, amount, toUSD),
  )
}

const formatPriceLabel = (adaAmount: number, token: string): string => {
  const formattedAda = formatNumber(adaAmount, { maximumFractionDigits: 6 })
  return `~${formattedAda} ADA/${token}`
}

const extractPriceValues = (
  entries: [string, ActionData][],
  readFn: (action: Action, data: ActionData) => unknown,
  action: Action,
  toUSD?: ToUSDConverter,
): DisplayValue[] => {
  return entries.map(([token, data]) => {
    const priceValue = (readFn(action, data) as Value) ?? {}
    const adaAmount = priceValue.ADA ?? 0
    const priceLabel = formatPriceLabel(adaAmount, token)
    const adaValueObj = { ADA: adaAmount }
    const usdLabel = toUSD ? formatUSDValue(toUSD, adaValueObj) : "$0.00"
    return [priceLabel, usdLabel]
  })
}

const extractSectionValues = (
  entries: [string, ActionData][],
  section: SectionConfig,
  action: Action,
  toUSD?: ToUSDConverter,
): DisplayValue[] => {
  if (section.label === "Price") {
    return extractPriceValues(entries, section.read, action, toUSD)
  }

  const isBurn = action.actionType === "Burn"
  const isTotalCost = section.label === "Total Cost"

  const values: DisplayValue[] = []
  entries.forEach(([, data]) => {
    const sectionValue = section.read(action, data) as Value

    if (
      isBurn &&
      isTotalCost &&
      typeof sectionValue === "object" &&
      sectionValue
    ) {
      Object.entries(sectionValue).forEach(([token, amount]) => {
        if (amount && amount > 0) {
          values.push(formatTokenValue(token, amount, toUSD))
        }
      })
    } else {
      values.push(...extractDisplayValues(sectionValue, toUSD))
    }
  })
  return values
}

const getActiveToken = (
  action: Action,
  isMint: boolean,
  isPay: boolean,
): string => {
  if (isMint) {
    return isPay ? action.activePayToken : action.activeReceiveToken
  }
  return isPay ? action.activeReceiveToken : action.activePayToken
}

const createSectionConfigs = (): SectionConfig[] => [
  {
    label: "Base Cost",
    read: (_, data) => data.baseCost,
    default: (action) => {
      const isMint = action.actionType === "Mint"
      const token = !isMint ? getActiveToken(action, !isMint, true) : "ADA"
      return [`0.00 ${token}`, "$0.00"]
    },
  },
  {
    label: `Mint Fee`,
    read: (_, data) => data.actionFee,
    default: (action) => {
      const isMint = action.actionType === "Mint"
      const token = !isMint ? getActiveToken(action, !isMint, true) : "ADA"
      return [`0.00 ${token}`, "$0.00"]
    },
  },
  {
    label: "Operator Fee",
    read: (_, data) => data.operatorFee,
    default: () => ["0.00 ADA", "$0.00"],
  },
  {
    label: "Total Cost",
    read: (_, data) => data.totalCost,
    default: (action) => {
      const isBurn = action.actionType === "Burn"
      if (isBurn) {
        return [
          ["0.00 ADA", "$0.00"],
          [`0.00 ${action.activePayToken}`, "$0.00"],
        ]
      }
      return [`0.00 ${action.activePayToken}`, "$0.00"]
    },
  },
  {
    label: "Refundable Deposit",
    read: (action) => action.protocolData?.protocolData.refundableDeposit,
    default: () => ["0.00 ADA", "$0.00"],
  },
  {
    label: "Price",
    read: (_, data) => data.price,
    default: (action) => {
      const isMint = action.actionType === "Mint"
      const token = getActiveToken(action, !isMint, true)
      return [`~0 ADA/${token}`, "$0.00"]
    },
  },
]

const addSectionToBuilder = (
  builder: ReturnType<typeof transactionSummaryBuilder>,
  section: SectionConfig,
  values: DisplayValue[],
) => {
  if (values.length > 1) {
    builder.addMulti(section.label, values)
  } else {
    const [top, bottom] = values[0] || ZERO_DISPLAY
    builder.addSingle(section.label, top, bottom)
  }
}

const buildSummary = (
  action: Action,
  actionData: Action["actionData"],
  toUSD?: ToUSDConverter,
) => {
  const builder = transactionSummaryBuilder()
  const isEmpty = !actionData || Object.keys(actionData).length === 0
  const entries = isEmpty ? [] : Object.entries(actionData)

  const sections = createSectionConfigs()
  sections[1].label = `${capitalize(action.actionType)} Fee`

  sections.forEach((section) => {
    const values = isEmpty
      ? normalizeToArray(section.default(action))
      : extractSectionValues(entries, section, action, toUSD)

    addSectionToBuilder(builder, section, values)
  })

  return builder.build()
}

export function useTransactionSummary({ action }: { action: Action }) {
  const { actionData, data } = action

  return useMemo(() => {
    const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined
    return buildSummary(action, actionData, toUSD)
  }, [action, actionData, data])
}
