import { type ActionType } from "../../components/dashboard/actionConfig"
import { type Token } from "@/lib/types/tokens"
import { formatNumber, roundToDecimals } from "@/utils"
import { type TokenType } from "@open-djed/api"
import { type Registry } from "@open-djed/registry"

type TokenAmounts = Partial<Record<Token, number>>

type TokenActionResult = {
  toSend: TokenAmounts
  toReceive: TokenAmounts
}

export type DualSectionState = {
  isDualSelected: boolean
  isLinkSelected: boolean
}

export type DualStateByType = Record<"pay" | "receive", DualSectionState>

export type SelectedTokensByType = Record<"pay" | "receive", Token[]>

export type MintBurnProtocolData = {
  protocolData: Partial<Record<
    Exclude<Token, "ADA">,
    {
      buyPrice: { ADA?: number }
      mintableAmount: TokenAmounts
      burnableAmount: TokenAmounts
    }
  >> & {
    refundableDeposit: { ADA?: number }
  }
  to: (values: TokenAmounts, token: Token) => number | undefined
  tokenActionData: (
    token: TokenType,
    actionType: ActionType,
    amount: { type: "In" | "Out"; amount: number }
  ) => TokenActionResult
}

/**
 * Calculates the minimum mintable or burnable amount based on the registry configuration.
 * 
 * @param registry The registry configuration containing the minimum amount for minting or burning, used to determine the lower limit for user input in the mint/burn action.
 * @returns The minimum mintable or burnable amount.
 */
export function calcMin(registry: Registry): number {
  return Math.floor((Number(registry.minAmount) / 1e6) * 1000) / 1000
}

/**
 * Calculates the maximum mintable or burnable amount for a given token based on the user's wallet balance, protocol data, and registry configuration.
 * 
 * @param token The token for which to calculate the maximum amount, used to determine the relevant buy price and mintable/burnable amounts from the protocol data.
 * @param actionType The type of action being performed, either "Mint" or "Burn".
 * @param walletBalance The user's wallet balance for each token.
 * @param data The protocol data containing necessary information for the calculation.
 * @param registry The registry configuration containing minimum amount and operator fee information.
 * @returns The maximum mintable or burnable amount for the given token.
 */
export function calcMax(
  token: Token,
  actionType: ActionType,
  walletBalance: Record<Token, number | undefined> | null,
  data: MintBurnProtocolData | undefined,
  registry: Registry
): number {
  if (!walletBalance || !data || token === "ADA") return 0

  const raw =
    actionType === "Burn"
      ? walletBalance[token] ?? 0
      : (Math.max((walletBalance.ADA ?? 0) - 5, 0) -
          (Number(registry.operatorFeeConfig.max) +
            (data.protocolData.refundableDeposit.ADA ?? 1823130)) /
            1e6) /
        (data.protocolData[token as Exclude<Token, "ADA">]?.buyPrice.ADA ?? 1)

  const cap =
    actionType === "Mint"
      ? data.protocolData[token as Exclude<Token, "ADA">]?.mintableAmount[token] ?? 0
      : data.protocolData[token as Exclude<Token, "ADA">]?.burnableAmount[token] ?? 0

  return Math.floor(Math.min(Math.max(raw, 0), cap) * 1000) / 1000
}

/**
 * Calculates the display suffix for a given token amount based on the protocol data and token type.
 * 
 * @param data The protocol data containing necessary information for the calculation, including token conversion logic.
 * @param token The token for which to calculate the suffix, used to determine the appropriate conversion and formatting based on the protocol data.
 * @param value The numeric value for which to calculate the suffix, representing the amount of the specified token that the user has input or is being processed in the action.
 * @returns A formatted string representing the calculated suffix for the given token amount. 
 */
export function calcSuffix(
  data: MintBurnProtocolData | undefined,
  token: Token,
  value: number
): string {
  if (!data) return "$0"
  return `$${formatNumber(data.to({ [token]: value }, "DJED") ?? 0, { maximumFractionDigits: 2 })}`
}

/**
 * Computes the opposite values for the given source amounts and target tokens based on the protocol data and action type.
 * 
 * For example, if the user is inputting the amount they want to "pay" in a "Mint" 
 * action, this function will compute the corresponding "receive" values for the target 
 * tokens, and vice versa for a "Burn" action. The computation relies on the `tokenActionData` 
 * function provided in the protocol data, which encapsulates the logic for how token amounts
 * convert based on the action type and direction (pay/receive).
 * 
 * @param type Determines whether to compute the "pay" or "receive" values.
 * @param actionType The type of action being performed, either "Mint" or "Burn".
 * @param sourceAmounts An object mapping source tokens to their respective amounts.
 * @param targetTokens An array of target tokens for which to compute the opposite values.
 * @param data The protocol data containing necessary information for the computation, including token action data and conversion logic.
 * @returns An object containing the computed opposite values for the target tokens and the corresponding action data for each source token.
 */
export function computeOppositeValues(
  type: "pay" | "receive",
  actionType: ActionType,
  sourceAmounts: TokenAmounts,
  targetTokens: Token[],
  data: MintBurnProtocolData
): { values: TokenAmounts; actionData: Partial<Record<Token, TokenActionResult>> } {
  const values: TokenAmounts = {}
  const actionData: Partial<Record<Token, TokenActionResult>> = {}
  const isMint = actionType === "Mint"

  for (const [token, amount] of Object.entries(sourceAmounts) as Array<[Token, number | undefined]>) {
    if (!amount || amount <= 0) continue

    const result = data.tokenActionData(
      token as TokenType,
      actionType,
      isMint ? { type: "Out", amount } : { type: "In", amount }
    )

    for (const targetToken of targetTokens) {
      const partialValue =
        type === "pay"
          ? isMint
            ? result.toSend.ADA ?? 0
            : result.toReceive[targetToken] ?? 0
          : result.toSend[targetToken] ?? 0

      values[targetToken] = roundToDecimals((values[targetToken] ?? 0) + partialValue, 4)
    }

    actionData[token] = result
  }

  return { values, actionData }
}

export function computeValueChange(
  type: "pay" | "receive",
  token: Token,
  value: number,
  actionType: ActionType,
  prevValues: TokenAmounts,
  dualState: DualStateByType,
  selectedTokens: SelectedTokensByType,
  data: MintBurnProtocolData
): { nextValues: TokenAmounts; actionData: Partial<Record<Token, TokenActionResult>> } {
  const opposite = type === "pay" ? "receive" : "pay"
  const isLinked = dualState[type].isLinkSelected
  const sourceTokens = isLinked ? selectedTokens[type] : [token]
  const targetTokens = selectedTokens[opposite]

  const nextValues: TokenAmounts = { ...prevValues }

  for (const sourceToken of sourceTokens) {
    nextValues[sourceToken] = value
  }

  const sourceAmounts = Object.fromEntries(
    selectedTokens[type].map((selectedToken) => [selectedToken, nextValues[selectedToken] ?? 0])
  ) as TokenAmounts

  const hasSourceAmount = Object.values(sourceAmounts).some((amount) => (amount ?? 0) > 0)

  if (!hasSourceAmount) {
    for (const targetToken of targetTokens) {
      nextValues[targetToken] = 0
    }
    return { nextValues, actionData: {} }
  }

  const { values, actionData } = computeOppositeValues(
    type,
    actionType,
    sourceAmounts,
    targetTokens,
    data
  )

  for (const targetToken of targetTokens) {
    nextValues[targetToken] = values[targetToken] ?? 0
  }

  return { nextValues, actionData }
}

/**
 * Computes the next selected tokens for a given type ("pay" or "receive") when a token change occurs.
 * 
 * @param selectedTokens The current mapping of selected tokens by type.
 * @param type The type of selection being changed, either "pay" or "receive".
 * @param currentToken The currently selected token that is being changed. 
 * @param tokens The list of available tokens to cycle through for selection.
 * @returns An updated mapping of selected tokens by type with the current token replaced by the next token in the list for the specified type.
 */
export function computeTokenChangeSelectedTokens(
  selectedTokens: SelectedTokensByType,
  type: "pay" | "receive",
  currentToken: Token,
  tokens: Token[]
): SelectedTokensByType {
  const nextToken = tokens[(tokens.indexOf(currentToken) + 1) % tokens.length]
  const nextSelection = selectedTokens[type].map((token) =>
    token === currentToken ? nextToken : token
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
 * Toggles the dual selection state for a given type 
 * ("pay" or "receive") and updates the selected tokens accordingly.
 * 
 * @param dualState The current dual state object containing the dual selection states for both "pay" and "receive" types.
 * @param selectedTokens The current mapping of selected tokens by type.
 * @param type The type for which to toggle the dual selection, either "pay" or "receive".
 * @param sectionTokens The list of tokens available in the section, used to determine the new selected tokens when dual selection is enabled.
 * @returns An object containing the updated dual state and selected tokens after toggling the dual selection for the specified type.
 */
export function computeDualToggleState(
  dualState: DualStateByType,
  selectedTokens: SelectedTokensByType,
  type: "pay" | "receive",
  sectionTokens: Token[]
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
 * Toggles the link state for a given type ("pay" or "receive") in the dual state object.
 * 
 * @param dualState The current dual state object containing the link and dual selection states for both "pay" and "receive" types.
 * @param type The type for which to toggle the link state, either "pay" or "receive".
 * @returns An updated dual state object with the link state toggled for the specified type.
 */
export function computeLinkToggleState(
  dualState: DualStateByType,
  type: "pay" | "receive"
): DualStateByType {
  return {
    ...dualState,
    [type]: { ...dualState[type], isLinkSelected: !dualState[type].isLinkSelected },
  }
}