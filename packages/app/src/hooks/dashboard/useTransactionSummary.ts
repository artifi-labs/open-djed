import { useMemo } from "react"
import { transactionSummaryBuilder } from "../../components/dashboard/transactionSummaryBuilder"
import { formatNumber, formatValue } from "@/utils"
import { type useMintBurnAction } from "./useMintBurnAction"
import type { Token } from "@/lib/types/tokens"
import { useTranslations } from "next-intl"
import type { Value } from "@/types"

type Action = ReturnType<typeof useMintBurnAction>
type DisplayValue = [string, string]
type ToUSDConverter = (value: Value) => number

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
  default: (action: Action) => DisplayValue | DisplayValue[]
}

// Helpers
const normalizeToArray = (
  value: DisplayValue | DisplayValue[],
): DisplayValue[] =>
  Array.isArray(value[0]) ? (value as DisplayValue[]) : [value as DisplayValue]

const ZERO_DISPLAY: DisplayValue = ["$0.00", "$0.00"]

const formatUSDValue = (
  toUSD: ToUSDConverter | undefined,
  valueObj: Value,
): string => {
  if (!toUSD) return "$0.00"
  return `$${formatNumber(toUSD(valueObj), { maximumFractionDigits: 2 })}`
}

const formatTokenEntry = (
  token: string,
  amount: number,
  toUSD?: ToUSDConverter,
): DisplayValue => {
  if (!Number.isFinite(amount)) return ZERO_DISPLAY
  const valueObj = { [token]: amount }
  return [
    formatValue(valueObj),
    toUSD ? formatUSDValue(toUSD, valueObj) : "$0.00",
  ]
}

const tokenMapToDisplayValues = (
  map: Partial<Record<Token, number>>,
  toUSD?: ToUSDConverter,
): DisplayValue[] => {
  const entries = Object.entries(map) as [Token, number][]
  if (entries.length === 0) return [ZERO_DISPLAY]
  return entries.map(([token, amount]) =>
    formatTokenEntry(token, amount, toUSD),
  )
}

const extractPriceValues = (
  price: ActionData["price"],
  toUSD?: ToUSDConverter,
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
      const usd = toUSD
        ? formatUSDValue(toUSD, { [unitToken]: amount })
        : "$0.00"
      values.push([label, usd])
    }
  }

  return values.length > 0 ? values : [ZERO_DISPLAY]
}

const extractSectionValues = (
  section: SectionConfig,
  actionData: ActionData,
  action: Action,
  toUSD?: ToUSDConverter,
): DisplayValue[] => {
  switch (section.key) {
    case "price": {
      if (!actionData.price) return [ZERO_DISPLAY]
      return extractPriceValues(actionData.price, toUSD)
    }

    case "totalCost": {
      if (!actionData.totalCost) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData.totalCost, toUSD)
    }

    case "refundableDeposit": {
      if (!actionData.refundableDeposit) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData.refundableDeposit, toUSD)
    }

    case "baseCost":
    case "actionFee":
    case "operatorFee": {
      if (!actionData.refundableDeposit) return [ZERO_DISPLAY]
      return tokenMapToDisplayValues(actionData[section.key], toUSD)
    }

    default:
      return normalizeToArray(section.default(action))
  }
}

// Sections Config
const createSectionConfigs = (
  t: ReturnType<typeof useTranslations>,
): SectionConfig[] => [
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
  action: Action,
  actionData: ActionData | null,
  t: ReturnType<typeof useTranslations>,
  toUSD?: ToUSDConverter,
) => {
  const builder = transactionSummaryBuilder()
  const isEmpty = !actionData

  const sections = createSectionConfigs(t)
  // Overwrite the fee label based on current action type
  sections[1].label = t(`dashboard.${action.actionType.toLowerCase()}Fee`)

  sections.forEach((section) => {
    const values = isEmpty
      ? normalizeToArray(section.default(action))
      : extractSectionValues(section, actionData, action, toUSD)

    addSectionToBuilder(builder, section, values)
  })

  return builder.build()
}

// Hook
export function useTransactionSummary({ action }: { action: Action }) {
  const { actionData, data } = action
  const t = useTranslations()

  console.log("ActionData", actionData)

  return useMemo(() => {
    const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined
    return buildSummary(action, actionData, t, toUSD)
  }, [action, actionData, data, t])
}
