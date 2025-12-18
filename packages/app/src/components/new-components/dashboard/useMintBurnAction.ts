"use client"

import * as React from "react"
import { ACTION_CONFIG, ActionType } from "./actionConfig"
import { SUPPORTED_TOKENS, Token } from "@/lib/tokens"
import { useWallet } from "@/context/WalletContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { TokenType } from "@open-djed/api"
import { useSidebar } from "@/context/SidebarContext"

type ProtocolData = NonNullable<ReturnType<typeof useProtocolData>["data"]>
type ActionData = ReturnType<ProtocolData["tokenActionData"]>
type ActionDataMap = Partial<Record<Token, ActionData>>

const createInitialRecord = <T>(initialValue: T): Record<Token, T> =>
  SUPPORTED_TOKENS.reduce(
    (acc, token) => {
      acc[token] = initialValue
      return acc
    },
    {} as Record<Token, T>,
  )

type ApplyValueFn = (token: Token, value: string) => void

const parseBalance = (balanceStr?: string): number =>
  balanceStr ? parseFloat(balanceStr) || 0 : 0

const applyFromBalance = (
  token: Token,
  balanceStr: string | undefined,
  apply: ApplyValueFn,
  factor: number,
  { requirePositive = false } = {},
) => {
  const bal = parseBalance(balanceStr)
  if (requirePositive && bal <= 0) return
  apply(token, (bal * factor).toString())
}

export function useMintBurnAction(defaultActionType: ActionType) {
  const [actionType, setActionType] =
    React.useState<ActionType>(defaultActionType)
  const config = ACTION_CONFIG[actionType]
  const { wallet } = useWallet()
  const { openWalletSidebar } = useSidebar()
  const [linkClicked, setLinkClicked] = React.useState(false)
  const [bothSelected, setBothSelected] = React.useState(false)
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
  const hasWalletConnected = Boolean(wallet)

  const { isPending, error, data } = useProtocolData()
  const [actionData, setActionData] = React.useState<ActionDataMap>({})
  const [protocolData, setProtocolData] = React.useState<
    ProtocolData | undefined
  >(undefined)

  const isMint = actionType === "Mint"

  React.useEffect(() => {
    if (data) {
      setProtocolData(data)
    }
  }, [data])

  React.useEffect(() => {
    setBothSelected(false)
    setPayValues(createInitialRecord(0))
    setReceiveValues(createInitialRecord(0))
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [actionType, config.pay, config.receive])

  React.useEffect(() => {
    setLinkClicked(false)
  }, [actionType])

  const recalcReceiveFromPay = (payToken: Token, payValue: number) => {
    if (!data) return

    const nextReceive: Record<Token, number> = createInitialRecord(0)
    const nextActionData: ActionDataMap = {}
    const receiveTokens = bothSelected ? config.receive : [activeReceiveToken]

    const action = isMint ? "Mint" : "Burn"

    receiveTokens.forEach((rc) => {
      let amountInToken: number
      let tokenAction: TokenType

      if (!isMint) {
        tokenAction = payToken as TokenType
        amountInToken = payValue
      } else {
        tokenAction = rc as TokenType
        amountInToken = payValue
      }

      const actionData = data.tokenActionData(
        tokenAction,
        action,
        amountInToken,
      )

      nextReceive[rc] = actionData.toReceive[rc] ?? 0
      nextActionData[tokenAction] = actionData
    })

    setReceiveValues(nextReceive)
    setActionData(nextActionData)
  }

  const recalcPayFromReceive = (receiveToken: Token, receiveValue: number) => {
    if (!data) return

    const nextPay: Record<Token, number> = createInitialRecord(0)
    const nextActionData: ActionDataMap = {}
    const payTokens = bothSelected ? config.pay : [activePayToken]
    const action = isMint ? "Mint" : "Burn"

    payTokens.forEach((pc) => {
      let amountInToken: number
      let tokenDoAction: TokenType

      if (isMint) {
        tokenDoAction = receiveToken as TokenType
        amountInToken = receiveValue
      } else {
        tokenDoAction = pc as TokenType
        amountInToken = receiveValue
      }

      const actionData = data.tokenActionData(
        tokenDoAction,
        action,
        amountInToken,
      )

      nextPay[pc] = actionData.toSend[pc] ?? 0
      nextActionData[tokenDoAction] = actionData
    })

    setPayValues(nextPay)
    setActionData(nextActionData)
  }

  const recalcFromPay = (token: Token, value: number) => {
    setPayValues((prev) => ({ ...prev, [token]: value }))
    if (value === 0) {
      setReceiveValues(createInitialRecord(0))
      setActionData({})
      return
    }
    recalcReceiveFromPay(token, value)
  }

  const recalcFromReceive = (token: Token, value: number) => {
    setReceiveValues((prev) => ({ ...prev, [token]: value }))
    if (value === 0) {
      setPayValues(createInitialRecord(0))
      setActionData({})
      return
    }
    recalcPayFromReceive(token, value)
  }

  const onPayValueChange = (token: Token, value: string) =>
    recalcFromPay(token, parseFloat(value) || 0)
  const onReceiveValueChange = (token: Token, value: string) =>
    recalcFromReceive(token, parseFloat(value) || 0)
  const onActionChange = (newActionType: ActionType) =>
    setActionType(newActionType)

  const onPayHalf = (token: Token, balanceStr?: string) =>
    applyFromBalance(token, balanceStr, onPayValueChange, 0.5)

  const onPayMax = (token: Token, balanceStr?: string) =>
    applyFromBalance(token, balanceStr, onPayValueChange, 1)

  const onReceiveHalf = (token: Token, balanceStr?: string) =>
    applyFromBalance(token, balanceStr, onReceiveValueChange, 0.5, {
      requirePositive: true,
    })

  const onReceiveMax = (token: Token, balanceStr?: string) =>
    applyFromBalance(token, balanceStr, onReceiveValueChange, 1, {
      requirePositive: true,
    })

  const onPayTokenChange = (newToken: Token) => {
    const oldToken = activePayToken
    const oldValue = payValues[oldToken] || 0
    setActivePayToken(newToken)

    const nextPayValues = { ...payValues, [newToken]: oldValue }
    setPayValues(nextPayValues)

    if (!isMint) {
      recalcReceiveFromPay(newToken, oldValue)
    } else {
      // TODO: Implement this when dual Input is implemented
    }
  }

  const onReceiveTokenChange = (newToken: Token) => {
    const oldValue = receiveValues[activeReceiveToken] || 0

    setActiveReceiveToken(newToken)

    const nextReceiveValues = { ...receiveValues, [newToken]: oldValue }
    setReceiveValues(nextReceiveValues)

    if (isMint) {
      recalcPayFromReceive(newToken, oldValue)
    } else {
      // TODO: Implement this when dual Input is implemented
    }
  }

  const onBothSelectedChange = (selected: boolean) => {
    setBothSelected(selected)
    setPayValues(createInitialRecord(0))
    setReceiveValues(createInitialRecord(0))
  }

  const onHalfClick = (t: Token) => {
    if (config.pay.includes(t)) onPayHalf(t, wallet?.balance[t]?.toString())
    else if (config.receive.includes(t))
      onReceiveHalf(t, wallet?.balance[t]?.toString())
  }

  const onMaxClick = (t: Token) => {
    if (config.pay.includes(t)) onPayMax(t, wallet?.balance[t]?.toString())
    else if (config.receive.includes(t))
      onReceiveMax(t, wallet?.balance[t]?.toString())
  }

  const onLinkClick = () => setLinkClicked(!linkClicked)

  const onButtonClick = () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    console.log("Button clicked for", actionType)
    console.log("Pay values:", payValues)
    console.log("Receive values:", receiveValues)
  }

  return {
    actionType,
    actionData,
    protocolData,
    data,
    onActionChange,
    config,
    hasWalletConnected,
    bothSelected,
    onBothSelectedChange,
    payValues,
    receiveValues,
    activePayToken,
    activeReceiveToken,
    onPayValueChange,
    onReceiveValueChange,
    onPayTokenChange,
    onReceiveTokenChange,
    onPayHalf,
    onPayMax,
    onReceiveHalf,
    onReceiveMax,
    onButtonClick,
    onHalfClick,
    onMaxClick,
    linkClicked,
    onLinkClick,
  }
}
