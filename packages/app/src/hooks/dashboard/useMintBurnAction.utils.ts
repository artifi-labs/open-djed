import type { ActionType } from "@/types"
import type { Token } from "@/types"
import { formatNumber, roundToDecimals } from "@/utils"
import { type TokenType } from "@open-djed/api"
import { type Registry } from "@open-djed/registry"
import { type ActionData } from "./useTransactionSummary"
import type {
  DualStateByType,
  SelectedTokensByType,
} from "./useMintBurnAction.types"

type TokenAmounts = Partial<Record<Token, number>>

type TokenActionResult = {
  baseCost: TokenAmounts
  actionFee: TokenAmounts
  actionFeePercentage: number
  operatorFee: TokenAmounts
  totalCost: TokenAmounts
  toPay: TokenAmounts
  toReceive: TokenAmounts
  price: TokenAmounts
}

export type MintBurnProtocolData = {
  protocolData: Partial<
    Record<
      Exclude<Token, "ADA">,
      {
        buyPrice: { ADA?: number }
        mintableAmount: TokenAmounts
        burnableAmount: TokenAmounts
      }
    >
  > & {
    refundableDeposit: { ADA?: number }
  }
  to: (values: TokenAmounts, token: Token) => number | undefined
  tokenActionData: (
    token: TokenType,
    actionType: ActionType,
    amount: { type: "In" | "Out"; amount: number },
  ) => TokenActionResult
}

/**
 * Calculates the minimum mint/burn amount based on the registry configuration.
 *
 * @param registry The registry containing the minimum amount configuration.
 * @returns The minimum amount in token units (e.g., DJED or SHEN).
 */
export function calcMin(registry: Registry): number {
  return Math.floor((Number(registry.minAmount) / 1e6) * 1000) / 1000
}

/**
 * Calculates the maximum mint/burn amount for a given token and action type, based on the user's wallet balance,
 * protocol data, and registry configuration.
 *
 * @param token The token for which to calculate the maximum amount (e.g., DJED or SHEN).
 * @param actionType The type of action ("Mint" or "Burn").
 * @param walletBalance The user's wallet balance for each token.
 * @param data The protocol data containing price and mintable/burnable amounts.
 * @param registry The registry containing operator fee configuration.
 * @returns The maximum amount the user can mint or burn, in token units.
 * Returns 0 if wallet balance or protocol data is missing, or if the token is ADA.
 */
export function calcMax(
  token: Token,
  actionType: ActionType,
  walletBalance: Record<Token, number | undefined> | null,
  data: MintBurnProtocolData | undefined,
  registry: Registry,
): number {
  if (!walletBalance || !data || token === "ADA") return 0

  const raw =
    actionType === "Burn"
      ? (walletBalance[token] ?? 0)
      : (Math.max((walletBalance.ADA ?? 0) - 5, 0) -
          (Number(registry.operatorFeeConfig.max) +
            (data.protocolData.refundableDeposit.ADA ?? 1823130)) /
            1e6) /
        (data.protocolData[token as Exclude<Token, "ADA">]?.buyPrice.ADA ?? 1)

  const cap =
    actionType === "Mint"
      ? (data.protocolData[token as Exclude<Token, "ADA">]?.mintableAmount[
          token
        ] ?? 0)
      : (data.protocolData[token as Exclude<Token, "ADA">]?.burnableAmount[
          token
        ] ?? 0)

  return Math.floor(Math.min(Math.max(raw, 0), cap) * 1000) / 1000
}

/**
 * Calculates the USD price suffix for a given token and value, using protocol data for conversion.
 *
 * @param data The protocol data containing the conversion function.
 * @param token The token for which to calculate the price suffix (e.g., DJED or SHEN).
 * @param value The value in token units for which to calculate the price suffix.
 * @returns A string representing the price in USD, formatted with a dollar sign and two decimal places.
 */
export function calcSuffix(
  data: MintBurnProtocolData | undefined,
  token: Token,
  value: number,
): string {
  if (!data) return "$0"
  return `$${formatNumber(data.to({ [token]: value }, "DJED") ?? 0, { maximumFractionDigits: 2 })}`
}

/**
 * Computes the opposite values for a given action type and source amounts, based on the protocol data.
 *
 * @param type The type of value to compute ("pay" or "receive").
 * @param actionType The type of action ("Mint" or "Burn").
 * @param sourceAmounts The amounts of the source tokens involved in the action.
 * @param targetTokens The target tokens for which to compute the opposite values.
 * @param data The protocol data containing the token action data function.
 * @returns An object containing the computed opposite values and the detailed action data for the transaction.
 */
export function computeOppositeValues(
  type: "pay" | "receive",
  actionType: ActionType,
  sourceAmounts: TokenAmounts,
  targetTokens: Token[],
  data: MintBurnProtocolData,
): { values: TokenAmounts; actionData: ActionData } {
  const values: TokenAmounts = {}
  const actionData: ActionData = {
    baseCost: {},
    actionFee: {},
    operatorFee: {},
    totalCost: {},
    refundableDeposit: data.protocolData.refundableDeposit,
    price: {},
  }
  const isMint = actionType === "Mint"

  const mergeAmounts = (target: TokenAmounts, source: TokenAmounts) => {
    for (const [targetToken, sourceAmount] of Object.entries(source) as [
      Token,
      number,
    ][]) {
      target[targetToken] = (target[targetToken] ?? 0) + sourceAmount
    }
  }

  for (const [token, amount] of Object.entries(sourceAmounts) as Array<
    [Token, number | undefined]
  >) {
    if (!amount || amount <= 0) continue

    // TODO: THIS WILL NEED TO BE CHANGED TO SUPPORT DUAL BURN/MINT
    const result = data.tokenActionData(
      token as TokenType,
      actionType,
      isMint ? { type: "Out", amount } : { type: "In", amount },
    )

    for (const targetToken of targetTokens) {
      const partialValue =
        type === "pay"
          ? isMint
            ? (result.toPay.ADA ?? 0)
            : (result.toReceive[targetToken] ?? 0)
          : (result.toPay[targetToken] ?? 0)

      values[targetToken] = roundToDecimals(
        (values[targetToken] ?? 0) + partialValue,
        4,
      )
    }

    mergeAmounts(actionData.baseCost, result.baseCost)
    mergeAmounts(actionData.actionFee, result.actionFee)
    mergeAmounts(actionData.operatorFee, result.operatorFee)
    mergeAmounts(actionData.totalCost, result.totalCost)

    for (const [unitToken, unitPrice] of Object.entries(result.price) as [
      Token,
      number,
    ][]) {
      const unitPriceMap = actionData.price[unitToken] ?? {}
      actionData.price[unitToken] = unitPriceMap
      unitPriceMap[token] = (unitPriceMap[token] ?? 0) + unitPrice
    }
  }

  console.log("ActionData", actionData)

  return {
    values,
    actionData,
  }
}

/**
 * Computes the change in values for a mint/burn action based on user input, selected tokens, and protocol data.
 *
 * @param type The type of value being changed ("pay" or "receive").
 * @param token The token for which the value is being changed.
 * @param value The new value input by the user for the specified token.
 * @param actionType The type of action ("Mint" or "Burn").
 * @param prevValues The previous values for all tokens before the change.
 * @param dualState The current state of the dual selection for pay and receive sections.
 * @param selectedTokens The currently selected tokens for pay and receive sections.
 * @param data The protocol data containing the token action data function.
 * @returns An object containing the next values for all tokens after the change, and the detailed action data for the transaction.
 */
export function computeValueChange(
  type: "pay" | "receive",
  token: Token,
  value: number,
  actionType: ActionType,
  prevValues: TokenAmounts,
  dualState: DualStateByType,
  selectedTokens: SelectedTokensByType,
  data: MintBurnProtocolData,
): { nextValues: TokenAmounts; actionData: ActionData | null } {
  const opposite = type === "pay" ? "receive" : "pay"
  const isLinked = dualState[type].isLinkSelected
  const sourceTokens = isLinked ? selectedTokens[type] : [token]
  const targetTokens = selectedTokens[opposite]

  const nextValues: TokenAmounts = { ...prevValues }

  for (const sourceToken of sourceTokens) {
    nextValues[sourceToken] = value
  }

  const sourceAmounts = Object.fromEntries(
    selectedTokens[type].map((selectedToken) => [
      selectedToken,
      nextValues[selectedToken] ?? 0,
    ]),
  ) as TokenAmounts

  const hasSourceAmount = Object.values(sourceAmounts).some(
    (amount) => (amount ?? 0) > 0,
  )

  if (!hasSourceAmount) {
    for (const targetToken of targetTokens) {
      nextValues[targetToken] = 0
    }
    return { nextValues, actionData: null }
  }

  const { values, actionData } = computeOppositeValues(
    type,
    actionType,
    sourceAmounts,
    targetTokens,
    data,
  )

  for (const targetToken of targetTokens) {
    nextValues[targetToken] = values[targetToken] ?? 0
  }

  return {
    nextValues,
    actionData,
  }
}

/**
 * Computes the new selected tokens for a given section type when the user
 * toggles through available tokens.
 *
 * @param selectedTokens The currently selected tokens for pay and receive sections.
 * @param type The section type for which to compute the new selected tokens ("pay" or "receive").
 * @param currentToken The currently selected token that the user is toggling from.
 * @param tokens The available tokens for the specified section type.
 * @returns The updated selected tokens for pay and receive sections after toggling the token selection for the specified section type.
 */
export function computeTokenChangeSelectedTokens(
  selectedTokens: SelectedTokensByType,
  type: "pay" | "receive",
  currentToken: Token,
  tokens: Token[],
): SelectedTokensByType {
  const nextToken = tokens[(tokens.indexOf(currentToken) + 1) % tokens.length]
  const nextSelection = selectedTokens[type].map((t) =>
    t === currentToken ? nextToken : t,
  )

  if (new Set(nextSelection).size !== nextSelection.length) {
    return selectedTokens
  }

  return {
    ...selectedTokens,
    [type]: nextSelection,
  }
}

/**
 * Computes the new state of the dual toggle for a given section type, based on the current dual state and selected tokens.
 *
 * @param dualState The current state of the dual selection for pay and receive sections.
 * @param selectedTokens The currently selected tokens for pay and receive sections.
 * @param type The section type for which to compute the dual toggle state ("pay" or "receive").
 * @param sectionTokens The available tokens for the specified section type.
 * @returns An object containing the updated dual state and selected tokens for the specified section type after toggling the dual selection.
 */
export function computeDualToggleState(
  dualState: DualStateByType,
  selectedTokens: SelectedTokensByType,
  type: "pay" | "receive",
  sectionTokens: Token[],
): { dualState: DualStateByType; selectedTokens: SelectedTokensByType } {
  const isDual = !dualState[type].isDualSelected

  return {
    dualState: {
      ...dualState,
      [type]: { ...dualState[type], isDualSelected: isDual },
    },
    selectedTokens: {
      ...selectedTokens,
      [type]: isDual ? [...sectionTokens] : [sectionTokens[0]],
    },
  }
}

/**
 * Computes the new state of the link toggle for a given section type, based on the current dual state.
 *
 * @param dualState The current state of the dual selection for pay and receive sections.
 * @param type The section type for which to compute the link toggle state ("pay" or "receive").
 * @returns The updated dual state with the link toggle state for the specified section type toggled.
 */
export function computeLinkToggleState(
  dualState: DualStateByType,
  type: "pay" | "receive",
): DualStateByType {
  return {
    ...dualState,
    [type]: {
      ...dualState[type],
      isLinkSelected: !dualState[type].isLinkSelected,
    },
  }
}
