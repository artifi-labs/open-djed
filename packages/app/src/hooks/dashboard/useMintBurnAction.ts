"use client"

import * as React from "react"
import { ACTION_CONFIG, type ActionType } from "../../components/dashboard/actionConfig"
import { type Token } from "@/lib/types/tokens"
import { useWallet } from "@/context/WalletContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { AppError, type TokenType } from "@open-djed/api"
import { registryByNetwork } from "@open-djed/registry"
import { type InputStatus } from "../../components/input-fields/TransactionInput"
import { env } from "@/lib/envLoader"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { useTranslations } from "next-intl"
import { useSidebar } from "@/context/SidebarContext"
import { useToast } from "@/context/ToastContext"
import { useApiClient } from "@/context/ApiClientContext"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { getWalletData } from "@/lib/getWalletData"
import {
  calcMax,
  calcMin,
  calcSuffix,
  computeDualToggleState,
  computeLinkToggleState,
  computeTokenChangeSelectedTokens,
  computeValueChange,
} from "./useMintBurnAction.utils"

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

      setInputValues((prev) => {
        const { nextValues, actionData: newActionData } = computeValueChange(
          type,
          token,
          value,
          actionType,
          prev,
          dualState,
          selectedTokens,
          data
        )
        setActionData(newActionData as ActionDataMap)
        return nextValues
      })
    },
    [data, actionType, dualState, selectedTokens]
  )

  const handleTokenChange = React.useCallback(
    (type: "pay" | "receive", currentToken: Token) => {
      setSelectedTokens((prev) => ({
        ...computeTokenChangeSelectedTokens(prev, type, currentToken, config[type]),
      }))

      setInputValues({})
      setActionData({})
    },
    [config]
  )

  const handleDualChange = React.useCallback(
    (type: "pay" | "receive") => {
      const nextState = computeDualToggleState(dualState, selectedTokens, type, config[type])

      setDualState(nextState.dualState)
      setSelectedTokens(nextState.selectedTokens)

      setInputValues({})
      setActionData({})
    },
    [dualState, selectedTokens, config]
  )

  const handleLinkChange = React.useCallback((type: "pay" | "receive") => {
    setDualState((prev) => computeLinkToggleState(prev, type))
  }, [])

  const handleButtonClick = React.useCallback(async () => {
    console.log("Button clicked with values:", inputValues, "and action data:", actionData)
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    if (!wallet) return

    const relevantTokens = actionType === "Mint"
      ? selectedTokens.receive
      : selectedTokens.pay

    const activeInput = relevantTokens
      .map((token) => ({
        token,
        value: inputValues[token] ?? 0,
        max: tokenLimits[token]?.max ?? 0,
        min: tokenLimits[token]?.min ?? 0,
      }))
      .find((i) => i.value > 0 && i.token !== "ADA")
    if (!activeInput) return

    const { token, value, max, min } = activeInput

    if (value > max) {
      showToast({
        message: t("dashboard.messages.amountExceedsBalance"),
        type: "error",
      })
      return
    }

    if (value < min) {
      showToast({
        message: t("dashboard.messages.amountBelowMinimum", { amount: min, token }),
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
      showToast({ message: t("dashboard.messages.transactionFailed"), type: "error" })
    }
  }, [
    hasWalletConnected,
    openWalletSidebar,
    wallet,
    actionType,
    client,
    showToast,
    inputValues,
    actionData,
    selectedTokens,
    tokenLimits,
    t,
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
  }, [tokensStates, actionType, hasWalletConnected, reserveBounds, tokenLimits, t, handleButtonClick])

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