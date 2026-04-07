"use client"

import * as React from "react"
import { ACTION_CONFIG, type ActionType } from "../../components/dashboard/actionConfig"
import { type Token } from "@/lib/types/tokens"
import { useWallet, type Wallet } from "@/context/WalletContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { type TokenType } from "@open-djed/api"
import { useSidebar } from "@/context/SidebarContext"
import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { type Registry, registryByNetwork } from "@open-djed/registry"
import { type InputStatus } from "../../components/input-fields/TransactionInput"
import { formatNumber, roundToDecimals } from "@/utils"
import { env } from "@/lib/envLoader"

type ProtocolData = NonNullable<ReturnType<typeof useProtocolData>["data"]>
type ActionData = ReturnType<ProtocolData["tokenActionData"]>
type ActionDataMap = Partial<Record<Token, ActionData>>

export type TokenActionState = {
  token: Token
  value: number
  min: number
  max: number
  available: number | undefined
  disabled: boolean
  status: InputStatus
  suffix?: string
  onChange?: (value: number) => void
  onTokenChange?: () => void
  onHalfClick?: () => void
  onMaxClick?: () => void
}

export type TokenActionStateConfig = {
  dual: {
    text?: string
    disabled: boolean
    isDualSelected: boolean
    isLinkSelected?: boolean
    onDualChange?: () => void
    onLinkChange?: () => void
  }
  tokens: Token[]
  activeTokens: Token[]
  inputs: TokenActionState[]
}

export type TokenActionStateMap = {
  action: ActionType
  pay: TokenActionStateConfig
  receive: TokenActionStateConfig
}


function calculateTokenMinValue(registry: Registry) {
  return Math.floor((Number(registry.minAmount) / 1e6) * 1000) / 1000
}

function calculateTokenMaxValue(
  token: Token,
  actionType: ActionType,
  wallet: Wallet | null,
  data: ProtocolData | undefined,
  registry: Registry
) {
  if (!wallet || !data || token === "ADA") return 0

  const max =
    actionType === "Burn"
      ? wallet.balance[token]
      : (Math.max((wallet.balance.ADA ?? 0) - 5, 0) -
          (Number(registry.operatorFeeConfig.max) +
            (data.protocolData.refundableDeposit.ADA ?? 1823130)) /
            1e6) /
        (data.protocolData?.[token].buyPrice.ADA ?? 1)

  const bounded = Math.min(
    Math.max(max ?? 0, 0),
    actionType === "Mint"
      ? data.protocolData?.[token].mintableAmount[token] ?? 0
      : data.protocolData?.[token].burnableAmount[token] ?? 0
  )

  return Math.floor(bounded * 1000) / 1000
}

function getSuffix(
  data: ProtocolData | undefined,
  token: Token,
  value: number
) {
  if (!data) return "$0"

  return `$${formatNumber(
    data.to({ [token]: value }, "DJED") ?? 0,
    { maximumFractionDigits: 2 }
  )}`
}

function createTokenInput({
  token,
  type,
  actionType,
  wallet,
  data,
  registry,
  onValueChange,
  onTokenChange,
}: any): TokenActionState {
  const max = calculateTokenMaxValue(token, actionType, wallet, data, registry)
  const min = calculateTokenMinValue(registry)

  return {
    token,
    min,
    max,
    available: wallet && token === "ADA" ? wallet.balance[token] ?? 0 : undefined,
    disabled: token === "ADA",
    value: 0,
    status: "default",
    suffix: `$${formatNumber(data?.to({ [token]: "00.00" }, "DJED") ?? 0)}`,
    onChange: onValueChange,
    onTokenChange,
    onHalfClick: () => onValueChange(max / 2),
    onMaxClick: () => onValueChange(max),
  }
}

function computeOppositeValues({
  type,
  data,
  actionType,
  value,
  sourceTokens,
  targetTokens,
}: any) {
  const result: Partial<Record<Token, number>> = {}
  const actionData: ActionDataMap = {}

  sourceTokens.forEach((token: Token) => {
    const isMint = actionType === "Mint"

    const res = data.tokenActionData(
      token as TokenType,
      actionType,
      isMint
        ? { type: "Out", amount: value }
        : { type: "In", amount: value }
    )

    targetTokens.forEach((t: Token) => {
      result[t] =
        type === "pay"
          ? isMint
            ? roundToDecimals(res.toSend["ADA"] ?? 0, 4)
            : roundToDecimals(res.toReceive[t] ?? 0, 4)
          : roundToDecimals(res.toSend[t] ?? 0, 4)
    })

    actionData[token] = res
  })

  return { result, actionData }
}

export function useMintBurnAction(defaultActionType: ActionType) {
  const [actionType, setActionType] = React.useState(defaultActionType)
  const [actionData, setActionData] = React.useState<ActionDataMap>({})

  const { wallet } = useWallet()
  const { data } = useProtocolData()
  const { NETWORK } = env

  const registry = registryByNetwork[NETWORK]
  const config = ACTION_CONFIG[actionType]

  const hasWalletConnected = Boolean(wallet)

  const [tokensStates, setTokensStates] =
    React.useState<TokenActionStateMap>(() => ({
      action: defaultActionType,
      pay: { dual: { disabled: true, isDualSelected: false }, tokens: [], activeTokens: [], inputs: [] },
      receive: { dual: { disabled: true, isDualSelected: false }, tokens: [], activeTokens: [], inputs: [] },
    }))

  const handleValueChange = React.useCallback(
    (type: "pay" | "receive", token: Token, value: number) => {
      if (!data) return

      const oppositeType = type === "pay" ? "receive" : "pay"

      setTokensStates((prev) => {
        const section = prev[type]
        const opposite = prev[oppositeType]

        const isLinked = section.dual.isLinkSelected
        const sourceTokens = isLinked
          ? section.inputs.map((i) => i.token)
          : [token]

        const targetTokens = opposite.inputs.map((i) => i.token)

        const updatedSection = {
          ...section,
          inputs: section.inputs.map((i) =>
            isLinked || i.token === token
              ? {
                  ...i,
                  value,
                  suffix: getSuffix(data, i.token, value),
                }
              : i
          ),
        }

        let newOppositeInputs = opposite.inputs
        let newActionData: ActionDataMap = {}

        if (value > 0) {
          const { result, actionData } = computeOppositeValues({
            type,
            data,
            actionType,
            value,
            sourceTokens,
            targetTokens,
          })

          newOppositeInputs = opposite.inputs.map((i) => ({
            ...i,
            value: result[i.token] ?? 0,
          }))

          newActionData = actionData
        } else {
          newOppositeInputs = opposite.inputs.map((i) => ({
            ...i,
            value: 0,
          }))
        }

        setActionData(newActionData)

        return {
          ...prev,
          [type]: updatedSection,
          [oppositeType]: {
            ...opposite,
            inputs: newOppositeInputs,
          },
        }
      })
    },
    [data, actionType]
  )

  const handleTokenChange = React.useCallback(
    (type: "pay" | "receive", currentToken: Token) => {
      setTokensStates((prev) => {
        const section = prev[type]
        const tokens = section.tokens

        const nextToken =
          tokens[(tokens.indexOf(currentToken) + 1) % tokens.length]

        const inputs = section.inputs.map((input) =>
          input.token === currentToken
            ? createTokenInput({
                token: nextToken,
                type,
                actionType,
                wallet,
                data,
                registry,
                onValueChange: (v: number) =>
                  handleValueChange(type, nextToken, v),
                onTokenChange: () =>
                  handleTokenChange(type, nextToken),
              })
            : input
        )

        return {
          ...prev,
          [type]: {
            ...section,
            inputs,
            activeTokens: inputs.map((i) => i.token),
          },
        }
      })
    },
    [wallet, data, actionType, registry, handleValueChange]
  )

  const handleLinkChange = React.useCallback((type: "pay" | "receive") => {
    setTokensStates((prev) => {
      const section = prev[type]

      return {
        ...prev,
        [type]: {
          ...section,
          dual: {
            ...section.dual,
            isLinkSelected: !section.dual.isLinkSelected,
          },
        },
      }
    })
  }, [])
  
  const handleDualChange = React.useCallback(
    (type: "pay" | "receive") => {
      setTokensStates((prev) => {
        const section = prev[type]
        const isDualSelected = !section.dual.isDualSelected
        const tokens = config[type]

        const inputs = isDualSelected
          ? tokens.map((token) =>
              createTokenInput({
                token,
                type,
                actionType,
                wallet,
                data,
                registry,
                onValueChange: (v: number) =>
                  handleValueChange(type, token, v),
                onTokenChange: () =>
                  handleTokenChange(type, token),
              })
            )
          : [
              createTokenInput({
                token: tokens[0],
                type,
                actionType,
                wallet,
                data,
                registry,
                onValueChange: (v: number) =>
                  handleValueChange(type, tokens[0], v),
                onTokenChange: () =>
                  handleTokenChange(type, tokens[0]),
              }),
            ]

        return {
          ...prev,
          [type]: {
            ...section,
            dual: {
              ...section.dual,
              isDualSelected,
            },
            inputs,
            activeTokens: inputs.map((i) => i.token),
          },
        }
      })
    },
    [config, actionType, wallet, data, registry, handleValueChange]
  )

  // Reset inputs and action data when action type changes
  React.useEffect(() => {
    const buildSection = (type: "pay" | "receive") => {
      const tokens = config[type]

      return {
        dual: {
          text: `${actionType} both (DJED & SHEN)`,
          disabled: !config[`${type}ShowDual`],
          isDualSelected: false,
          isLinkSelected: false,
          onDualChange: () => handleDualChange(type),
          onLinkChange: () => handleLinkChange(type),
        },
        tokens,
        activeTokens: [tokens[0]],
        inputs: [
          createTokenInput({
            token: tokens[0],
            type,
            actionType,
            wallet,
            data,
            registry,
            onValueChange: (v: number) =>
              handleValueChange(type, tokens[0], v),
            onTokenChange: () =>
              handleTokenChange(type, tokens[0]),
          }),
        ],
      }
    }

    setTokensStates({
      action: actionType,
      pay: buildSection("pay"),
      receive: buildSection("receive"),
    })

    setActionData({})
  }, [actionType, wallet, data])

  return {
    tokensStates,
    actionType,
    actionData,
    protocolData: data,
    data,
    onActionChange: setActionType,
    config,
    hasWalletConnected,
    onButtonClick: undefined,
    hasMaxAmount: Boolean(wallet),
    minMessage: "",
  }
}