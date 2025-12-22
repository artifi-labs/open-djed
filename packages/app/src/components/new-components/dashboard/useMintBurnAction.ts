"use client"

import * as React from "react"
import { ACTION_CONFIG, type ActionType } from "./actionConfig"
import { SUPPORTED_TOKENS, type Token } from "@/lib/tokens"
import { useWallet } from "@/context/WalletContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import type { TokenType } from "@open-djed/api"
import { useSidebar } from "@/context/SidebarContext"
import { getWalletData } from "@/lib/getWalletData"
import { useApiClient } from "@/context/ApiClientContext"
import { AppError } from "@open-djed/api/src/errors"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { useToast } from "@/context/ToastContext"
import { maxReserveRatio, minReserveRatio } from "@open-djed/math"

type ProtocolData = NonNullable<ReturnType<typeof useProtocolData>["data"]>
type ActionData = ReturnType<ProtocolData["tokenActionData"]>
type ActionDataMap = Partial<Record<Token, ActionData>>

export type ReserveBoundsType = "below" | "above" | "in-bounds"

const createInitialRecord = <T>(initialValue: T): Record<Token, T> =>
  SUPPORTED_TOKENS.reduce(
    (acc, token) => {
      acc[token] = initialValue
      return acc
    },
    {} as Record<Token, T>,
  )

const parseBalance = (balanceStr?: string): number =>
  balanceStr ? parseFloat(balanceStr) || 0 : 0

const parseValue = (value: string): number => parseFloat(value) || 0

interface CalculationParams {
  data: ProtocolData
  action: ActionType
  sourceToken: Token
  sourceValue: number
  targetTokens: Token[]
}

const calculateTokenAction = (
  data: ProtocolData,
  token: Token,
  action: "Mint" | "Burn",
  amount: number,
  isMint: boolean,
): ActionData => {
  const tokenAction = (isMint ? token : token) as TokenType
  const amountInToken = amount

  return data.tokenActionData(tokenAction, action, amountInToken)
}

const calculateFromPay = ({
  data,
  action,
  sourceToken,
  sourceValue,
  targetTokens,
}: CalculationParams) => {
  const isMint = action === "Mint"
  const nextReceive: Record<Token, number> = createInitialRecord(0)
  const nextActionData: ActionDataMap = {}

  targetTokens.forEach((targetToken) => {
    const actionData = calculateTokenAction(
      data,
      sourceToken,
      action,
      sourceValue,
      isMint,
    )

    nextReceive[targetToken] = isMint
      ? (actionData.toSend["ADA"] ?? 0)
      : (actionData.toReceive[targetToken] ?? 0)
    nextActionData[sourceToken] = actionData
  })

  return { receive: nextReceive, actionData: nextActionData }
}

const calculateFromReceive = ({
  data,
  action,
  sourceToken,
  sourceValue,
  targetTokens,
}: CalculationParams) => {
  const isMint = action === "Mint"
  const nextPay: Record<Token, number> = createInitialRecord(0)
  const nextActionData: ActionDataMap = {}
  targetTokens.forEach((targetToken) => {
    let token = sourceToken

    if (!isMint) {
      // TODO: IF burning and sourceToken is ADA we need to convert ADA or modify useProtocol to accept ada
      console.log(sourceToken)
      token = targetToken
    }

    const actionData = calculateTokenAction(
      data,
      token,
      action,
      sourceValue,
      isMint,
    )

    nextPay[targetToken] = actionData.toSend[targetToken] ?? 0
    nextActionData[token] = actionData
  })

  return { pay: nextPay, actionData: nextActionData }
}

type ApplyValueFn = (token: Token, value: string) => void

interface ApplyBalanceOptions {
  requirePositive?: boolean
}

const applyBalance = (
  token: Token,
  balanceStr: string | undefined,
  applyFn: ApplyValueFn,
  factor: number,
  options: ApplyBalanceOptions = {},
) => {
  const balance = parseBalance(balanceStr)
  if (options.requirePositive && balance <= 0) return
  applyFn(token, (balance * factor).toString())
}

const useTokenState = (config: (typeof ACTION_CONFIG)[ActionType]) => {
  const [payValues, setPayValues] = React.useState<Record<Token, number>>(
    createInitialRecord(0),
  )
  const [receiveValues, setReceiveValues] = React.useState<
    Record<Token, number>
  >(createInitialRecord(0))
  const [activePayToken, setActivePayToken] = React.useState<Token>(
    config.pay[0],
  )
  const [activeReceiveToken, setActiveReceiveToken] = React.useState<Token>(
    config.receive[0],
  )

  const resetValues = React.useCallback(() => {
    setPayValues(createInitialRecord(0))
    setReceiveValues(createInitialRecord(0))
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [config.pay, config.receive])

  return {
    payValues,
    setPayValues,
    receiveValues,
    setReceiveValues,
    activePayToken,
    setActivePayToken,
    activeReceiveToken,
    setActiveReceiveToken,
    resetValues,
  }
}

const useTokenCalculations = (
  data: ProtocolData | undefined,
  action: ActionType,
  config: (typeof ACTION_CONFIG)[ActionType],
  bothSelected: boolean,
  activePayToken: Token,
  activeReceiveToken: Token,
) => {
  const getTargetTokens = React.useCallback(
    (direction: "pay" | "receive") => {
      if (bothSelected) {
        return direction === "pay" ? config.receive : config.pay
      }
      return direction === "pay" ? [activeReceiveToken] : [activePayToken]
    },
    [bothSelected, config, activePayToken, activeReceiveToken],
  )

  const calculateFromPayValue = React.useCallback(
    (sourceToken: Token, sourceValue: number) => {
      if (!data || sourceValue === 0) {
        return { receive: createInitialRecord(0), actionData: {} }
      }

      return calculateFromPay({
        data,
        action,
        sourceToken,
        sourceValue,
        targetTokens: getTargetTokens("pay"),
      })
    },
    [data, action, getTargetTokens],
  )

  const calculateFromReceiveValue = React.useCallback(
    (sourceToken: Token, sourceValue: number) => {
      if (!data || sourceValue === 0) {
        return { pay: createInitialRecord(0), actionData: {} }
      }

      return calculateFromReceive({
        data,
        action,
        sourceToken,
        sourceValue,
        targetTokens: getTargetTokens("receive"),
      })
    },
    [data, action, getTargetTokens],
  )

  return { calculateFromPayValue, calculateFromReceiveValue }
}

export function useMintBurnAction(defaultActionType: ActionType) {
  const [actionType, setActionType] =
    React.useState<ActionType>(defaultActionType)
  const [bothSelected, setBothSelected] = React.useState(false)
  const [linkClicked, setLinkClicked] = React.useState(false)
  const [actionData, setActionData] = React.useState<ActionDataMap>({})

  const config = ACTION_CONFIG[actionType]
  const { wallet } = useWallet()
  const { openWalletSidebar } = useSidebar()
  const { data } = useProtocolData()

  const { showToast } = useToast()
  const client = useApiClient()

  const isMint = actionType === "Mint"
  const hasWalletConnected = Boolean(wallet)

  const reserveDetails = React.useCallback(() => {
    const maxRatio = maxReserveRatio.toNumber() * 100
    const minRatio = minReserveRatio.toNumber() * 100
    const reserveRatio = (data?.protocolData.reserve.ratio ?? 0) * 100

    const reserveBounds: ReserveBoundsType =
      reserveRatio >= minRatio && reserveRatio <= maxRatio
        ? "in-bounds"
        : reserveRatio <= minRatio
          ? "below"
          : "above"

    const reserveWarning: string | null =
      reserveBounds === "in-bounds"
        ? null
        : reserveBounds === "below"
          ? `DJED minting and SHEN burning is not permitted when the reserve ratio drops below ${minRatio}%.`
          : `SHEN minting is not permitted when the reserve ratio rises above ${maxRatio}%.`

    return {
      maxRatio,
      minRatio,
      reserveRatio,
      reserveBounds,
      reserveWarning,
    }
  }, [maxReserveRatio, minReserveRatio, data?.protocolData.reserve.ratio])

  const {
    payValues,
    setPayValues,
    receiveValues,
    setReceiveValues,
    activePayToken,
    setActivePayToken,
    activeReceiveToken,
    setActiveReceiveToken,
    resetValues,
  } = useTokenState(config)

  const { calculateFromPayValue, calculateFromReceiveValue } =
    useTokenCalculations(
      data,
      actionType,
      config,
      bothSelected,
      activePayToken,
      activeReceiveToken,
    )

  // Reset state when action type changes
  React.useEffect(() => {
    setBothSelected(false)
    resetValues()
    setLinkClicked(false)
    setActionData({})
  }, [actionType, resetValues])

  const handlePayValueChange = React.useCallback(
    (token: Token, value: string) => {
      const numValue = parseValue(value)
      setPayValues((prev) => ({ ...prev, [token]: numValue }))

      const result = calculateFromPayValue(token, numValue)
      setReceiveValues(result.receive)
      setActionData(result.actionData)
    },
    [calculateFromPayValue, setPayValues, setReceiveValues],
  )

  const handleReceiveValueChange = React.useCallback(
    (token: Token, value: string) => {
      const numValue = parseValue(value)
      setReceiveValues((prev) => ({ ...prev, [token]: numValue }))

      const result = calculateFromReceiveValue(token, numValue)
      setPayValues(result.pay)
      setActionData(result.actionData)
    },
    [calculateFromReceiveValue, setPayValues, setReceiveValues],
  )

  const handlePayHalf = React.useCallback(
    (token: Token, balanceStr?: string) => {
      applyBalance(token, balanceStr, handlePayValueChange, 0.5)
    },
    [handlePayValueChange],
  )

  const handlePayMax = React.useCallback(
    (token: Token, balanceStr?: string) => {
      applyBalance(token, balanceStr, handlePayValueChange, 1)
    },
    [handlePayValueChange],
  )

  const handleReceiveHalf = React.useCallback(
    (token: Token, balanceStr?: string) => {
      applyBalance(token, balanceStr, handleReceiveValueChange, 0.5, {
        requirePositive: true,
      })
    },
    [handleReceiveValueChange],
  )

  const handleReceiveMax = React.useCallback(
    (token: Token, balanceStr?: string) => {
      applyBalance(token, balanceStr, handleReceiveValueChange, 1, {
        requirePositive: true,
      })
    },
    [handleReceiveValueChange],
  )

  const handlePayTokenChange = React.useCallback(
    (newToken: Token) => {
      const currentValue = payValues[activePayToken] || 0
      setActivePayToken(newToken)
      setPayValues((prev) => ({ ...prev, [newToken]: currentValue }))

      if (!isMint) {
        const result = calculateFromPayValue(newToken, currentValue)
        setReceiveValues(result.receive)
        setActionData(result.actionData)
      }
    },
    [
      payValues,
      activePayToken,
      setActivePayToken,
      setPayValues,
      isMint,
      calculateFromPayValue,
      setReceiveValues,
    ],
  )

  const handleReceiveTokenChange = React.useCallback(
    (newToken: Token) => {
      const currentValue = receiveValues[activeReceiveToken] || 0
      setActiveReceiveToken(newToken)
      setReceiveValues((prev) => ({ ...prev, [newToken]: currentValue }))

      if (isMint) {
        const result = calculateFromReceiveValue(newToken, currentValue)
        setPayValues(result.pay)
        setActionData(result.actionData)
      }
    },
    [
      receiveValues,
      activeReceiveToken,
      setActiveReceiveToken,
      setReceiveValues,
      isMint,
      calculateFromReceiveValue,
      setPayValues,
    ],
  )

  const handleBothSelectedChange = React.useCallback(
    (selected: boolean) => {
      setBothSelected(selected)
      setPayValues(createInitialRecord(0))
      setReceiveValues(createInitialRecord(0))
      setActionData({})
    },
    [setPayValues, setReceiveValues],
  )

  const handleHalfClick = React.useCallback(
    (token: Token, balance: string) => {
      if (config.pay.includes(token)) {
        handlePayHalf(token, balance)
      } else if (config.receive.includes(token)) {
        handleReceiveHalf(token, balance)
      }
    },
    [config, wallet, handlePayHalf, handleReceiveHalf],
  )

  const handleMaxClick = React.useCallback(
    (token: Token, balance: string) => {
      if (config.pay.includes(token)) {
        handlePayMax(token, balance)
      } else if (config.receive.includes(token)) {
        handleReceiveMax(token, balance)
      }
    },
    [config, wallet, handlePayMax, handleReceiveMax],
  )

  const handleLinkClick = React.useCallback(() => {
    setLinkClicked((prev) => !prev)
  }, [])

  const handleButtonClick = React.useCallback(async () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    console.log("Button clicked for", actionType)
    console.log("Pay values:", payValues)
    console.log("Receive values:", receiveValues)
    //NOTE: This is a workaround to dynamically import the Cardano libraries without causing issues with SSR.
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")

    if (!wallet) return
    if (payValues && !Object.values(payValues).some((value) => value > 0))
      return

    const tokenAmount = Object.entries(payValues).find(([, value]) => value > 0)

    if (!tokenAmount) return

    try {
      const { address, utxos } = await getWalletData(wallet)

      const response = await client.api[":token"][":action"][":amount"][
        "tx"
      ].$post({
        param: {
          token: tokenAmount[0] as TokenType,
          action: actionType,
          amount: tokenAmount[1].toString(),
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
        message: `Transaction submitted succesfully!`,
        type: "success",
      })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        showToast({
          message: `${err.message}`,
          type: "error",
        })
        return
      }

      showToast({
        message: `Transaction failed. Please try again.`,
        type: "error",
      })
    }
  }, [
    hasWalletConnected,
    openWalletSidebar,
    actionType,
    payValues,
    receiveValues,
  ])

  return {
    actionType,
    actionData,
    protocolData: data,
    data,
    onActionChange: setActionType,
    config,
    hasWalletConnected,
    bothSelected,
    onBothSelectedChange: handleBothSelectedChange,
    payValues,
    receiveValues,
    activePayToken,
    activeReceiveToken,
    onPayValueChange: handlePayValueChange,
    onReceiveValueChange: handleReceiveValueChange,
    onPayTokenChange: handlePayTokenChange,
    onReceiveTokenChange: handleReceiveTokenChange,
    onPayHalf: handlePayHalf,
    onPayMax: handlePayMax,
    onReceiveHalf: handleReceiveHalf,
    onReceiveMax: handleReceiveMax,
    onButtonClick: handleButtonClick,
    onHalfClick: handleHalfClick,
    onMaxClick: handleMaxClick,
    linkClicked,
    onLinkClick: handleLinkClick,
    reserveDetails,
  }
}
