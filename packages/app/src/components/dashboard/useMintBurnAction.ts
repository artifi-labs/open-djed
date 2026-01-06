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
import { registryByNetwork } from "@open-djed/registry"
import { type InputStatus } from "../input-fields/TransactionInput"
import { roundToDecimals } from "@/lib/utils"
import { env } from "@/lib/envLoader"

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
  const nextReceive: Record<Token, string> = createInitialRecord("0")
  const nextActionData: ActionDataMap = {}

  targetTokens.forEach((targetToken) => {
    const actionData = calculateTokenAction(
      data,
      sourceToken,
      action,
      sourceValue,
      isMint,
    )

    const receiveAmount = isMint
      ? (actionData.toSend["ADA"] ?? 0)
      : (actionData.toReceive[targetToken] ?? 0)

    nextReceive[targetToken] = roundToDecimals(receiveAmount, 4).toString()
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
  const nextPay: Record<Token, string> = createInitialRecord("0")
  const nextActionData: ActionDataMap = {}
  targetTokens.forEach((targetToken) => {
    let token = sourceToken

    if (!isMint) {
      // TODO: IF burning and sourceToken is ADA we need to convert ADA or modify useProtocol to accept ada
      token = targetToken
    }

    const actionData = calculateTokenAction(
      data,
      token,
      action,
      sourceValue,
      isMint,
    )

    nextPay[targetToken] = roundToDecimals(
      actionData.toSend[targetToken] ?? 0,
      4,
    ).toString()
    nextActionData[token] = actionData
  })

  return { pay: nextPay, actionData: nextActionData }
}

const useTokenState = (config: (typeof ACTION_CONFIG)[ActionType]) => {
  const [payValues, setPayValues] = React.useState<Record<Token, string>>(
    createInitialRecord("0"),
  )
  const [receiveValues, setReceiveValues] = React.useState<
    Record<Token, string>
  >(createInitialRecord("0"))
  const [activePayToken, setActivePayToken] = React.useState<Token>(
    config.pay[0],
  )
  const [activeReceiveToken, setActiveReceiveToken] = React.useState<Token>(
    config.receive[0],
  )

  const resetValues = React.useCallback(() => {
    setPayValues(createInitialRecord("0"))
    setReceiveValues(createInitialRecord("0"))
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
        return { receive: createInitialRecord("0"), actionData: {} }
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
        return { pay: createInitialRecord("0"), actionData: {} }
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
  const { NETWORK } = env

  const { showToast } = useToast()
  const client = useApiClient()

  const isMint = actionType === "Mint"
  const hasWalletConnected = Boolean(wallet)
  const registry = registryByNetwork[NETWORK]

  const [inputStatus, setInputStatus] = React.useState<InputStatus>("default")

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

  const maxAmount = React.useMemo(() => {
    if (!wallet || !data) return 0

    const currentToken =
      actionType === "Mint" ? activeReceiveToken : activePayToken

    if (currentToken === "ADA") return 0

    const maxTokenAmount =
      currentToken === null
        ? 0
        : Math.round(
            Math.min(
              Math.max(
                (actionType === "Burn"
                  ? wallet.balance[currentToken]
                  : ((wallet.balance.ADA ?? 0) -
                      (Number(registry.operatorFeeConfig.max) +
                        (data.protocolData.refundableDeposit.ADA ?? 1823130)) /
                        1e6) /
                    (data.protocolData
                      ? data.protocolData[currentToken].buyPrice.ADA
                      : 0)) ?? 0,
                0,
              ),
              (actionType === "Mint"
                ? data.protocolData?.[currentToken].mintableAmount[currentToken]
                : data.protocolData?.[currentToken].burnableAmount[
                    currentToken
                  ]) ?? 0,
            ) * 1e6,
          ) / 1e6

    // Floor to 3 decimal places to avoid exceeding user balance
    return Math.floor(maxTokenAmount * 1000) / 1000
  }, [
    actionType,
    data?.protocolData,
    registry.operatorFeeConfig.max,
    activePayToken,
    activeReceiveToken,
    isMint,
    wallet?.balance,
  ])

  const handlePayValueChange = React.useCallback(
    (token: Token, value: string) => {
      setPayValues((prev) => ({ ...prev, [token]: value }))
      const numValue = parseFloat(value) || 0

      const result = calculateFromPayValue(token, numValue)
      setReceiveValues(result.receive)
      setActionData(result.actionData)

      if (wallet && numValue > maxAmount) {
        setInputStatus("error")
        showToast({
          message: `The amount added is greater than the available balance.`,
          type: "error",
        })
      } else if (inputStatus !== "default" || payValues[token] === "0") {
        setInputStatus("default")
      }
    },
    [calculateFromPayValue, setPayValues, setReceiveValues],
  )

  const handleReceiveValueChange = React.useCallback(
    (token: Token, value: string) => {
      setReceiveValues((prev) => ({ ...prev, [token]: value }))
      const numValue = parseValue(value) || 0
      const result = calculateFromReceiveValue(token, numValue)

      setPayValues(result.pay)
      setActionData(result.actionData)

      if (wallet && numValue > maxAmount) {
        setInputStatus("error")
        showToast({
          message: `The amount added is greater than the available balance.`,
          type: "error",
        })
      } else if (inputStatus !== "default" || payValues[token] === "0") {
        setInputStatus("default")
      }
    },
    [calculateFromReceiveValue, setPayValues, setReceiveValues],
  )

  const handlePayHalf = React.useCallback(
    (token: Token) => {
      handlePayValueChange(token, (maxAmount / 2).toString())
    },
    [handlePayValueChange, maxAmount],
  )

  const handlePayMax = React.useCallback(
    (token: Token) => {
      handlePayValueChange(token, maxAmount.toString())
    },
    [handlePayValueChange, maxAmount],
  )

  const handleReceiveHalf = React.useCallback(
    (token: Token) => {
      handleReceiveValueChange(token, (maxAmount / 2).toString())
    },
    [handleReceiveValueChange],
  )

  const handleReceiveMax = React.useCallback(
    (token: Token) => {
      handleReceiveValueChange(token, maxAmount.toString())
    },
    [handleReceiveValueChange],
  )

  const handlePayTokenChange = React.useCallback(
    (newToken: Token) => {
      const currentValue = payValues[activePayToken] || "0"
      setActivePayToken(newToken)
      setPayValues((prev) => ({ ...prev, [newToken]: currentValue }))

      if (!isMint) {
        const numValue = parseFloat(currentValue) || 0
        const result = calculateFromPayValue(newToken, numValue)
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
      const currentValue = receiveValues[activeReceiveToken] || "0"
      setActiveReceiveToken(newToken)
      setReceiveValues((prev) => ({ ...prev, [newToken]: currentValue }))

      if (isMint) {
        const numValue = parseFloat(currentValue) || 0
        const result = calculateFromReceiveValue(newToken, numValue)
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
      setPayValues(createInitialRecord("0"))
      setReceiveValues(createInitialRecord("0"))
      setActionData({})
    },
    [setPayValues, setReceiveValues],
  )

  const handleHalfClick = React.useCallback(
    (token: Token) => {
      if (config.pay.includes(token)) {
        handlePayHalf(token)
      } else if (config.receive.includes(token)) {
        handleReceiveHalf(token)
      }
    },
    [config, wallet, handlePayHalf, handleReceiveHalf],
  )

  const handleMaxClick = React.useCallback(
    (token: Token) => {
      if (config.pay.includes(token)) {
        handlePayMax(token)
      } else if (config.receive.includes(token)) {
        handleReceiveMax(token)
      }
    },
    [config, handlePayMax, handleReceiveMax],
  )

  const handleLinkClick = React.useCallback(() => {
    setLinkClicked((prev) => !prev)
  }, [])

  const handleButtonClick = React.useCallback(async () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    if (!wallet) return

    const valuesToUse = actionType === "Mint" ? receiveValues : payValues

    if (
      valuesToUse &&
      !Object.values(valuesToUse).some((value) => parseFloat(value) > 0)
    )
      return

    const tokenAmountArray = Object.entries(valuesToUse).find(
      ([, value]) => parseFloat(value) > 0,
    )
    if (!tokenAmountArray) return

    const token: TokenType | null = tokenAmountArray
      ? (tokenAmountArray[0] as TokenType)
      : null
    if (!token) return

    const tokenAmount = tokenAmountArray[1]
    const tokenAmountNumber = parseFloat(tokenAmountArray[1])

    if (wallet && tokenAmountNumber > maxAmount) {
      showToast({
        message: `The amount added is greater than the available balance.`,
        type: "error",
      })
      return
    }

    //NOTE: This is a workaround to dynamically import the Cardano libraries without causing issues with SSR.
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")

    try {
      const { address, utxos } = await getWalletData(wallet)

      const response = await client.api[":token"][":action"][":amount"][
        "tx"
      ].$post({
        param: {
          token: token,
          action: actionType,
          amount: tokenAmount,
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
    maxAmount: maxAmount,
    hasMaxAmount: wallet ? true : false,
    inputStatus,
  }
}
