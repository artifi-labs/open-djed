"use client"

import * as React from "react"
import { ACTION_CONFIG, type ActionType } from "../../components/dashboard/actionConfig"
import { type Token } from "@/lib/types/tokens"
import { useWallet } from "@/context/WalletContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { AppError, type TokenType } from "@open-djed/api"
import { type Registry, registryByNetwork } from "@open-djed/registry"
import { type InputStatus } from "../../components/input-fields/TransactionInput"
import { formatNumber, roundToDecimals } from "@/utils"
import { env } from "@/lib/envLoader"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { useTranslations } from "next-intl"
import { useSidebar } from "@/context/SidebarContext"
import { useToast } from "@/context/ToastContext"
import { useApiClient } from "@/context/ApiClientContext"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { getWalletData } from "@/lib/getWalletData"

// Types

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
  suffix: string
  message?: {
    message?: string
  }
  onChange: (value: number) => void
  onTokenChange: () => void
  onHalfClick: () => void
  onMaxClick: () => void
}

export type SectionDualState = {
  text: string
  disabled: boolean
  isDualSelected: boolean
  isLinkSelected: boolean
  onDualChange: () => void
  onLinkChange: () => void
}

export type TokenActionStateConfig = {
  dual: SectionDualState
  tokens: Token[]
  activeTokens: Token[]
  inputs: TokenActionState[]
}

export type TokenActionStateMap = {
  action: ActionType
  pay: TokenActionStateConfig
  receive: TokenActionStateConfig
}

export type ButtonState = {
  text: string
  disabled: boolean
  onClick?: () => Promise<void>
}

// Internal Types

type InputValues = Partial<Record<Token, number>>

type DualSectionState = {
  isDualSelected: boolean
  isLinkSelected: boolean
}

type DualState = {
  pay: DualSectionState
  receive: DualSectionState
}

type SelectedTokensState = {
  pay: Token[]
  receive: Token[]
}

// Pure Functions

function calcMin(registry: Registry): number {
  return Math.floor((Number(registry.minAmount) / 1e6) * 1000) / 1000
}

function calcMax(
  token: Token,
  actionType: ActionType,
  walletBalance: Record<Token, number | undefined> | null,
  data: ProtocolData | undefined,
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
        (data.protocolData[token].buyPrice.ADA ?? 1)

  const cap =
    actionType === "Mint"
      ? data.protocolData[token].mintableAmount[token] ?? 0
      : data.protocolData[token].burnableAmount[token] ?? 0

  return Math.floor(Math.min(Math.max(raw, 0), cap) * 1000) / 1000
}

function calcSuffix(data: ProtocolData | undefined, token: Token, value: number): string {
  if (!data) return "$0"
  return `$${formatNumber(data.to({ [token]: value }, "DJED") ?? 0, { maximumFractionDigits: 2 })}`
}

function computeOppositeValues(
  type: "pay" | "receive",
  actionType: ActionType,
  value: number,
  sourceTokens: Token[],
  targetTokens: Token[],
  data: ProtocolData
): { values: Partial<Record<Token, number>>; actionData: ActionDataMap } {
  const values: Partial<Record<Token, number>> = {}
  const actionData: ActionDataMap = {}
  const isMint = actionType === "Mint"

  for (const token of sourceTokens) {
    const res = data.tokenActionData(
      token as TokenType,
      actionType,
      isMint ? { type: "Out", amount: value } : { type: "In", amount: value }
    )

    for (const t of targetTokens) {
      values[t] =
        type === "pay"
          ? isMint
            ? roundToDecimals(res.toSend["ADA"] ?? 0, 4)
            : roundToDecimals(res.toReceive[t] ?? 0, 4)
          : roundToDecimals(res.toSend[t] ?? 0, 4)
    }

    actionData[token] = res
  }

  return { values, actionData }
}

export function useMintBurnAction(defaultActionType: ActionType) {
  const { wallet } = useWallet()
  const { data } = useProtocolData()
  const { reserveBounds } = useReserveDetails()
  const t = useTranslations()
  const { openWalletSidebar } = useSidebar()
  const { showToast } = useToast()
  const client = useApiClient()

  const { NETWORK } = env
  const registry = registryByNetwork[NETWORK]

  const [actionType, setActionType] = React.useState(defaultActionType)
  const config = ACTION_CONFIG[actionType]
  const hasWalletConnected = Boolean(wallet)
  const hasMaxAmount = Boolean(wallet)

  const defaultSelectedTokens = (): SelectedTokensState => ({
    pay: [config.pay[0]],
    receive: [config.receive[0]],
  })

  const defaultDualState = (): DualState => ({
    pay: { isDualSelected: false, isLinkSelected: false },
    receive: { isDualSelected: false, isLinkSelected: false },
  })

  const [selectedTokens, setSelectedTokens] = React.useState<SelectedTokensState>(defaultSelectedTokens)
  const [dualState, setDualState] = React.useState<DualState>(defaultDualState)
  const [inputValues, setInputValues] = React.useState<InputValues>({})
  const [actionData, setActionData] = React.useState<ActionDataMap>({})

  React.useEffect(() => {
    setSelectedTokens(defaultSelectedTokens())
    setDualState(defaultDualState())
    setInputValues({})
    setActionData({})
  }, [actionType])

  const tokenLimits = React.useMemo(() => {
    const allTokens = [...new Set([...selectedTokens.pay, ...selectedTokens.receive])]
    return Object.fromEntries(
      allTokens.map((token) => [
        token,
        {
          min: calcMin(registry),
          max: calcMax(token, actionType, wallet?.balance ?? null, data, registry),
        },
      ])
    ) as Record<Token, { min: number; max: number }>
  }, [selectedTokens, actionType, wallet, data, registry])

  // Handlers
  const handleValueChange = React.useCallback(
    (type: "pay" | "receive", token: Token, value: number) => {
      if (!data) return

      const opposite = type === "pay" ? "receive" : "pay"
      const isLinked = dualState[type].isLinkSelected
      const sourceTokens = isLinked ? selectedTokens[type] : [token]
      const targetTokens = selectedTokens[opposite]

      setInputValues((prev) => {
        const next: InputValues = { ...prev }

        for (const t of sourceTokens) {
          next[t] = value
        }

        if (value > 0) {
          const { values, actionData: newActionData } = computeOppositeValues(
            type,
            actionType,
            value,
            sourceTokens,
            targetTokens,
            data
          )
          for (const t of targetTokens) {
            next[t] = values[t] ?? 0
          }
          setActionData(newActionData)
        } else {
          for (const t of targetTokens) {
            next[t] = 0
          }
          setActionData({})
        }

        return next
      })
    },
    [data, actionType, dualState, selectedTokens]
  )

  const handleTokenChange = React.useCallback(
    (type: "pay" | "receive", currentToken: Token) => {
      const tokens = config[type]
      const nextToken = tokens[(tokens.indexOf(currentToken) + 1) % tokens.length]

      setSelectedTokens((prev) => ({
        ...prev,
        [type]: prev[type].map((t) => (t === currentToken ? nextToken : t)),
      }))

      setInputValues({})
      setActionData({})
    },
    [config]
  )

  const handleDualChange = React.useCallback(
    (type: "pay" | "receive") => {
      const isDual = !dualState[type].isDualSelected

      setDualState((prev) => ({
        ...prev,
        [type]: { ...prev[type], isDualSelected: isDual },
      }))

      setSelectedTokens((prev) => ({
        ...prev,
        [type]: isDual ? config[type] : [config[type][0]],
      }))

      setInputValues({})
      setActionData({})
    },
    [dualState, config]
  )

  const handleLinkChange = React.useCallback((type: "pay" | "receive") => {
    setDualState((prev) => ({
      ...prev,
      [type]: { ...prev[type], isLinkSelected: !prev[type].isLinkSelected },
    }))
  }, [])

  const handleButtonClick = React.useCallback(async () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    if (!wallet) return

    const relevantInputs = actionType === "Mint"
      ? tokensStates.receive.inputs
      : tokensStates.pay.inputs

    const activeInput = relevantInputs.find((i) => i.value > 0 && i.token !== "ADA")
    if (!activeInput) return

    const { token, value, max, min } = activeInput

    if (value > max) {
      showToast({
        message: "The amount added is greater than the available balance.",
        type: "error",
      })
      return
    }

    if (value < min) {
      showToast({
        message: `The amount added is less than the minimum allowed of ${min} ${token}.`,
        type: "error",
      })
      return
    }

    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")

    try {
      const { address, utxos } = await getWalletData(wallet)

      const response = await client.api[":token"][":action"][":amount"]["tx"].$post({
        param: {
          token: token as TokenType,
          action: actionType,
          amount: value.toString(),
        },
        json: { hexAddress: address, utxosCborHex: utxos },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new AppError(errorData.message)
      }

      const txCbor = await response.text()
      await signAndSubmitTx(wallet, txCbor, Transaction, TransactionWitnessSet)

      showToast({
        message: "Transaction submitted successfully!",
        type: "success",
      })

      setInputValues({})
      setActionData({})
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        showToast({ message: err.message, type: "error" })
        return
      }
      showToast({ message: "Transaction failed. Please try again.", type: "error" })
    }
  }, [
    hasWalletConnected,
    openWalletSidebar,
    wallet,
    actionType,
    client,
    showToast,
  ])


  // Returned values
  const tokensStates = React.useMemo((): TokenActionStateMap => {
    const buildSection = (type: "pay" | "receive"): TokenActionStateConfig => {
      const tokens = config[type]
      const active = selectedTokens[type]
      const dual = dualState[type]

      const inputs: TokenActionState[] = active.map((token) => {
        const value = inputValues[token] ?? 0
        const limits = tokenLimits[token] ?? { min: 0, max: 0 }

        const minMessage = 
          token !== "ADA" && value > 0 && value < limits.min
            ? { message: `Minimum amount is ${limits.min} ${token}` }
            : undefined
        
        const status: InputStatus = (minMessage !== undefined) ? "warning": "default"

        return {
          token,
          value,
          min: limits.min,
          max: limits.max,
          available: token === "ADA" ? wallet?.balance?.ADA ?? 0 : undefined,
          disabled: token === "ADA",
          status: status,
          suffix: calcSuffix(data, token, value),
          message: minMessage,
          onChange: (v) => handleValueChange(type, token, v),
          onTokenChange: () => handleTokenChange(type, token),
          onHalfClick: () => handleValueChange(type, token, limits.max / 2),
          onMaxClick: () => handleValueChange(type, token, limits.max),
        }
      })

      return {
        dual: {
          text: `${actionType} both (DJED & SHEN)`,
          disabled: !config[`${type}ShowDual`],
          isDualSelected: dual.isDualSelected,
          isLinkSelected: dual.isLinkSelected,
          onDualChange: () => handleDualChange(type),
          onLinkChange: () => handleLinkChange(type),
        },
        tokens,
        activeTokens: active,
        inputs,
      }
    }

    return {
      action: actionType,
      pay: buildSection("pay"),
      receive: buildSection("receive"),
    }
  }, [
    actionType,
    config,
    selectedTokens,
    dualState,
    inputValues,
    tokenLimits,
    wallet,
    data,
    handleValueChange,
    handleTokenChange,
    handleDualChange,
    handleLinkChange,
  ])

  const button = React.useMemo((): ButtonState => {
    const actionText = t(`action.${actionType.toLowerCase()}`)

    const relevantTokens = actionType === "Mint"
      ? tokensStates.receive.activeTokens
      : tokensStates.pay.activeTokens

    const disabledDueToReserve =
      ((relevantTokens.includes("DJED") && actionType === "Mint") ||
        (relevantTokens.includes("SHEN") && actionType === "Burn")) &&
      reserveBounds === "below"
        ? true
        : relevantTokens.includes("SHEN") && actionType === "Mint" && reserveBounds === "above"
          ? true
          : false

    const allInputs = [...tokensStates.pay.inputs, ...tokensStates.receive.inputs]
    const isPayEmpty = tokensStates.pay.inputs.some((i) => i.value === 0)
    const isReceiveEmpty = tokensStates.receive.inputs.some((i) => i.value === 0)
    const hasBelowMin = allInputs.some((i) => i.message !== undefined)

    const relevantToken = actionType === "Mint"
      ? tokensStates.receive.activeTokens[0]
      : tokensStates.pay.activeTokens[0]

    const minAmount = tokenLimits[relevantToken]?.min ?? 0
    const minMessage = minAmount > 0 ? t("dashboard.actionButton.minAmount", { amount: minAmount, token: relevantToken }) : ""

    const isDisabled = hasWalletConnected
      ? isPayEmpty || isReceiveEmpty || hasBelowMin || disabledDueToReserve
      : false

    const text = !hasWalletConnected
      ? t("dashboard.actionButton.wallet", { action: actionText })
      : isPayEmpty || isReceiveEmpty
        ? t("dashboard.actionButton.fillAmount", { action: actionText })
        : minMessage ? `${actionText} (${minMessage})` : actionText

    return { text, disabled: isDisabled, onClick: handleButtonClick }
  }, [tokensStates, actionType, hasWalletConnected, reserveBounds, tokenLimits, t])

  return {
    tokensStates,
    actionType,
    actionData,
    protocolData: data,
    data,
    onActionChange: setActionType,
    config,
    hasMaxAmount,
    button,
  }
}