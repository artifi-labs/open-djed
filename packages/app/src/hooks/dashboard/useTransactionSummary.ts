import { useMemo } from "react"
import { transactionSummaryBuilder } from "../../components/dashboard/transactionSummaryBuilder"
import { formatNumber, formatValue } from "@/utils"
import { type useMintBurnAction } from "./useMintBurnAction"
import type { ActionType, Token } from "@/types"
import { useTranslations } from "next-intl"
import type { Value } from "@/types"

type Action = ReturnType<typeof useMintBurnAction>
type DisplayValue = [string, string]
type ValueConverter = (value: Value) => number
type TranslateFn = (key: string) => string

export type TransactionSummaryAction = {
  actionType: ActionType
  actionData: ActionData | null
  data?: {
    to: (value: Value, target: Token) => number
  }
  tokensStates: {
    pay: { activeTokens: Token[] }
    receive: { activeTokens: Token[] }
  }
}

export type ActionData = {
  baseCost: Partial<Record<Token, number>>
  actionFee: Partial<Record<Token, number>>
  operatorFee: Partial<Record<Token, number>>
  totalCost: Partial<Record<Token, number>>
  refundableDeposit: Partial<Record<Token, number>>
  price: Partial<Record<Token, Partial<Record<Token, number>>>>
}

type SectionKey = keyof ActionData

interface SectionConfig {
  key: SectionKey
  label: string
  default: (action: TransactionSummaryAction) => DisplayValue | DisplayValue[]
}

// Helpers
const normalizeToArray = (
  value: DisplayValue | DisplayValue[],
): DisplayValue[] =>
  Array.isArray(value[0]) ? (value as DisplayValue[]) : [value as DisplayValue]

const ZERO_DISPLAY: DisplayValue = ["$0.00", "$0.00"]

const formatUSDValue = (
  convertValue: ValueConverter | undefined,
  valueObj: Value,
): string => {
  if (!convertValue) return "$0.00"
  return `$${formatNumber(convertValue(valueObj), { maximumFractionDigits: 2 })}`
}

const formatTokenEntry = (
  token: string,
  amount: number,
  convertValue?: ValueConverter,
): DisplayValue => {
  if (!Number.isFinite(amount)) return ZERO_DISPLAY
  const valueObj = { [token]: amount }
  return [
    formatValue(valueObj),
    convertValue ? formatUSDValue(convertValue, valueObj) : "$0.00",
  ]
}

const tokenMapToDisplayValues = (
  map: Partial<Record<Token, number>>,
  convertValue?: ValueConverter,
): DisplayValue[] => {
  const entries = Object.entries(map) as [Token, number][]
  if (entries.length === 0) return [ZERO_DISPLAY]
  return entries.map(([token, amount]) =>
    formatTokenEntry(token, amount, convertValue),
  )
}

const extractPriceValues = (
  price: ActionData["price"],
  convertValue?: ValueConverter,
): DisplayValue[] => {
  const values: DisplayValue[] = []

  for (const [unitToken, tokenMap] of Object.entries(price) as [
    Token,
    Partial<Record<Token, number>>,
  ][]) {
    for (const [token, amount] of Object.entries(tokenMap) as [
      Token,
      number,
    ][]) {
      if (amount === undefined) continue
      const label = `~${formatNumber(amount, { maximumFractionDigits: 6 })} ${unitToken}/${token}`
      const usd = convertValue
        ? formatUSDValue(convertValue, { [unitToken]: amount })
        : "$0.00"
      values.push([label, usd])
    }
  }

  return values.length > 0 ? values : [ZERO_DISPLAY]
}

const extractSectionValues = (
  section: SectionConfig,
  actionData: ActionData,
  action: TransactionSummaryAction,
  convertValue?: ValueConverter,
): DisplayValue[] => {
  switch (section.key) {
    case "price": {
      if (!actionData.price) return [ZERO_DISPLAY]
      return extractPriceValues(actionData.price, convertValue)
    }

    case "totalCost": {
      if (!actionData.totalCost) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData.totalCost, convertValue)
    }

    case "refundableDeposit": {
      if (!actionData.refundableDeposit) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData.refundableDeposit, convertValue)
    }

    case "baseCost":
    case "actionFee":
    case "operatorFee": {
      if (!actionData.refundableDeposit) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData[section.key], convertValue)
    }

    default:
      return normalizeToArray(section.default(action))
  }
}

// Sections Config
const createSectionConfigs = (t: TranslateFn): SectionConfig[] => [
  {
    key: "baseCost",
    label: t("dashboard.baseCost"),
    default: (action) => {
      const token =
        action.actionType === "Mint"
          ? "ADA"
          : (action.tokensStates.pay.activeTokens[0] ?? "ADA")
      return [`0.00 ${token}`, "$0.00"]
    },
  },
  {
    key: "actionFee",
    label: t("dashboard.mintFee"), // overwritten below per actionType
    default: (action) => {
      const token =
        action.actionType === "Mint"
          ? "ADA"
          : (action.tokensStates.pay.activeTokens[0] ?? "ADA")
      return [`0.00 ${token}`, "$0.00"]
    },
  },
  {
    key: "operatorFee",
    label: t("dashboard.operatorFee"),
    default: () => ["0.00 ADA", "$0.00"],
  },
  {
    key: "totalCost",
    label: t("dashboard.totalCost"),
    default: (action) => {
      if (action.actionType === "Burn") {
        const payTokens = action.tokensStates.pay.activeTokens
        return [
          ["0.00 ADA", "$0.00"],
          ...payTokens.map((t) => [`0.00 ${t}`, "$0.00"] as DisplayValue),
        ]
      }
      const token = action.tokensStates.pay.activeTokens[0] ?? "ADA"
      return [`0.00 ${token}`, "$0.00"]
    },
  },
  {
    key: "refundableDeposit",
    label: t("dashboard.refundableDeposit"),
    default: () => ["0.00 ADA", "$0.00"],
  },
  {
    key: "price",
    label: t("dashboard.price"),
    default: (action) => {
      const tokens =
        action.actionType === "Mint"
          ? action.tokensStates.receive.activeTokens
          : action.tokensStates.pay.activeTokens
      const targets = tokens.length > 0 ? tokens : ["DJED"]
      return targets.map((t) => [`~0 ADA/${t}`, "$0.00"] as DisplayValue)
    },
  },
]

// Builder
const addSectionToBuilder = (
  builder: ReturnType<typeof transactionSummaryBuilder>,
  section: SectionConfig,
  values: DisplayValue[],
) => {
  if (values.length > 1) {
    builder.addMulti(section.label, values)
  } else {
    const [top, bottom] = values[0] ?? ZERO_DISPLAY
    builder.addSingle(section.label, top, bottom)
  }
}

const buildSummary = (
  action: TransactionSummaryAction,
  actionData: ActionData | null,
  t: TranslateFn,
  convertValue?: ValueConverter,
) => {
  const builder = transactionSummaryBuilder()
  const isEmpty = !actionData

  const sections = createSectionConfigs(t)
  // Overwrite the fee label based on current action type
  sections[1].label = t(`dashboard.${action.actionType.toLowerCase()}Fee`)

  sections.forEach((section) => {
    const values = isEmpty
      ? normalizeToArray(section.default(action))
      : extractSectionValues(section, actionData, action, convertValue)

    addSectionToBuilder(builder, section, values)
  })

  return builder.build()
}

export const buildTransactionSummary = ({
  action,
  translate,
  convertValue,
}: {
  action: TransactionSummaryAction
  translate: TranslateFn
  convertValue?: ValueConverter
}) => buildSummary(action, action.actionData, translate, convertValue)

// Hook
export function useTransactionSummary({ action }: { action: Action }) {
  const { actionData, data } = action
  const t = useTranslations()

  return useMemo(() => {
    const convertValue = data
      ? (value: Value) => data.to(value, "DJED")
      : undefined
    return buildTransactionSummary({
      action,
      translate: t,
      convertValue,
    })
  }, [action, actionData, data, t])
}
