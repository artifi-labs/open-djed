"use client"

import * as React from "react"
import { ACTION_CONFIG, ActionType } from "./actionConfig"
import { SUPPORTED_TOKENS, Token } from "@/lib/tokens"
import { useWallet } from "@/context/WalletContext"
import { useWalletSidebar } from "@/context/SidebarContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { TokenType } from "@open-djed/api"

const createInitialRecord = (): Record<Token, number> =>
  SUPPORTED_TOKENS.reduce((acc, token) => {
    acc[token] = 0
    return acc
  }, {} as Record<Token, number>)


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
  const [actionType, setActionType] = React.useState<ActionType>(defaultActionType)
  const config = ACTION_CONFIG[actionType]
  const { wallet } = useWallet()
  const { openWalletSidebar } = useWalletSidebar()
  const [linkClicked, setLinkClicked] = React.useState(false)
  const [bothSelected, setBothSelected] = React.useState(false)
  const [payValues, setPayValues] = React.useState<Record<Token, number>>(createInitialRecord())
  const [receiveValues, setReceiveValues] = React.useState<Record<Token, number>>(createInitialRecord())
  const [activePayToken, setActivePayToken] = React.useState<Token>(config.pay[0])
  const [activeReceiveToken, setActiveReceiveToken] = React.useState<Token>(config.receive[0])
  const hasWalletConnected = Boolean(wallet)

  const { isPending, error, data: protocol } = useProtocolData()
  const [actionData, setActionData] = React.useState<Record<Token, any>>({})
  const [protocolData, setProtocolData] = React.useState<any>(protocol?.protocolData)

  const isMint = actionType === "Mint"

  React.useEffect(() => {
    if (protocol?.protocolData) {
      setProtocolData(protocol.protocolData)
    }
  }, [protocol?.protocolData])

  React.useEffect(() => {
    setBothSelected(false)
    setPayValues(createInitialRecord())
    setReceiveValues(createInitialRecord())
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [actionType, config.pay, config.receive])

  React.useEffect(() => {
    setLinkClicked(false)
  }, [actionType])

  const recalcFromPay = (token: Token, value: number) => {
    if (!protocol) return

    const nextPay = { ...payValues, [token]: value }
    const nextReceive: Record<Token, number> = createInitialRecord()
    const nextActionData: Record<Token, any> = {}

    const action = isMint ? "Mint" : "Burn"

    if (value === 0) {
      setReceiveValues({ ...receiveValues, [token]: 0 })
      setPayValues(createInitialRecord())
      setActionData({})
      return
    }


    config.receive.forEach(rc => {
      let amountInToken: number
      let tokenDoAction: TokenType

      if (!isMint) {
        // Burn: token is pay (DJED/SHEN), rc is receive (ADA)
        tokenDoAction = token as TokenType
        amountInToken = value
      } else {
        // Mint: token is pay (ADA), rc is receive (DJED/SHEN)
        // TODO: FIX THIS
        tokenDoAction = activeReceiveToken as TokenType
        amountInToken = value
      }

      const actionData = protocol.tokenActionData(tokenDoAction, action, amountInToken)
      nextReceive[rc] = actionData.toReceive[rc] ?? 0
      nextActionData[tokenDoAction] = actionData
    })

    setActivePayToken(token)
    setPayValues(nextPay)
    setReceiveValues(nextReceive)
    setActionData(nextActionData)
  }

  const recalcFromReceive = (token: Token, value: number) => {
    if (!protocol) return
    const nextReceive = { ...receiveValues, [token]: value }
    const nextPay: Record<Token, number> = createInitialRecord()
    const nextActionData: Record<Token, any> = {}
    
    if (value === 0) {
      setReceiveValues({ ...receiveValues, [token]: 0 })
      setPayValues(createInitialRecord())
      setActionData({})
      return
    }


    config.pay.forEach(pc => {
      let amountInToken: number
      let tokenDoAction: TokenType
      const action = isMint ? "Mint" : "Burn"

      if (isMint) {
        // Mint: token is receive (DJED/SHEN), pc is pay (ADA)
        tokenDoAction = token as TokenType
        amountInToken = value
      } else {
        // Burn: token is receive (ADA), pc is pay (DJED/SHEN)
        // TODO: FIX THIS
        tokenDoAction = activePayToken as TokenType
        amountInToken = value
      }

      const actionData = protocol.tokenActionData(tokenDoAction, action, amountInToken)
      nextPay[pc] = actionData.toSend[pc] ?? 0
      nextActionData[tokenDoAction] = actionData
    })

    setActiveReceiveToken(token)
    setReceiveValues(nextReceive)
    setPayValues(nextPay)
    setActionData(nextActionData)
  }

  const onPayValueChange = (token: Token, value: string) => recalcFromPay(token, parseFloat(value) || 0)
  const onReceiveValueChange = (token: Token, value: string) => recalcFromReceive(token, parseFloat(value) || 0)
  const onActionChange = (newActionType: ActionType) => setActionType(newActionType)

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
    const currentValue = payValues[newToken] || receiveValues[activeReceiveToken] || 0
    setActivePayToken(newToken)
    recalcFromPay(newToken, currentValue)
  }

  const onReceiveTokenChange = (newToken: Token) => {
    const currentValue = receiveValues[newToken] || payValues[activePayToken] || 0
    setActiveReceiveToken(newToken)
    recalcFromReceive(newToken, currentValue)
  }

  const onBothSelectedChange = (selected: boolean) => {
    setBothSelected(selected)
    setPayValues(createInitialRecord())
    setReceiveValues(createInitialRecord())
  }

  const onHalfClick = (t: Token) => {
    if (config.pay.includes(t)) onPayHalf(t, wallet?.balance[t]?.toString())
    else if (config.receive.includes(t)) onReceiveHalf(t, wallet?.balance[t]?.toString())
  }

  const onMaxClick = (t: Token) => {
    if (config.pay.includes(t)) onPayMax(t, wallet?.balance[t]?.toString())
    else if (config.receive.includes(t)) onReceiveMax(t, wallet?.balance[t]?.toString())
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
