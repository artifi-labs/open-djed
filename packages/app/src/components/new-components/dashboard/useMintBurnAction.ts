"use client"

import * as React from "react"
import { ACTION_CONFIG, ActionType } from "./actionConfig"
import { SUPPORTED_TOKENS, Token } from "@/lib/tokens"
import { useWallet } from "@/context/WalletContext"

const convert = (amount: number, from: Token, to: Token): number => {
  if (from === "ADA" && to === "DJED") return amount * 2
  if (from === "ADA" && to === "SHEN") return amount * 1.5
  if (from === "DJED" && to === "ADA") return amount / 2
  if (from === "SHEN" && to === "ADA") return amount / 1.5
  return amount
}

const createInitialRecord = (): Record<Token, number> =>
  SUPPORTED_TOKENS.reduce(
    (acc, token) => {
      acc[token] = 0
      return acc
    },
    {} as Record<Token, number>,
  )

export function useMintBurnAction(actionType: ActionType) {
  const config = ACTION_CONFIG[actionType]
  const isMint = actionType === "mint"
  const {wallet} = useWallet()

  const [bothSelected, setBothSelected] = React.useState(false)
  const [payValues, setPayValues] = React.useState<Record<Token, number>>(
    createInitialRecord(),
  )
  const [receiveValues, setReceiveValues] = React.useState<
    Record<Token, number>
  >(createInitialRecord())
  const [activePayToken, setActivePayToken] = React.useState<Token>(
    config.pay[0],
  )
  const [activeReceiveToken, setActiveReceiveToken] = React.useState<Token>(
    config.receive[0],
  )

  React.useEffect(() => {
    setBothSelected(false)
    setPayValues(createInitialRecord())
    setReceiveValues(createInitialRecord())
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [actionType, config.pay, config.receive])

  const recalcFromPay = (token: Token, value: number) => {
    const nextPay = { ...payValues, [token]: value }
    const nextReceive: Record<Token, number> = createInitialRecord()

    if (bothSelected && isMint && config.receive.length > 1) {
      const split = value / config.receive.length
      config.receive.forEach((rc) => {
        nextReceive[rc] = convert(split, token, rc)
      })
    } else {
      nextReceive[activeReceiveToken] = convert(
        value,
        token,
        activeReceiveToken,
      )
    }

    setActivePayToken(token)
    setPayValues(nextPay)
    setReceiveValues(nextReceive)
  }

  const recalcFromReceive = (token: Token, value: number) => {
    const nextReceive = { ...receiveValues, [token]: value }
    const nextPay: Record<Token, number> = createInitialRecord()

    if (bothSelected && !isMint && config.pay.length > 1) {
      config.pay.forEach((pc) => {
        const total = config.receive.reduce((acc, rc) => {
          const v = nextReceive[rc] || 0
          return acc + convert(v, rc, pc)
        }, 0)
        nextPay[pc] = total
      })
    } else {
      nextPay[activePayToken] = convert(value, token, activePayToken)
    }

    setActiveReceiveToken(token)
    setReceiveValues(nextReceive)
    setPayValues(nextPay)
  }

  const onPayValueChange = (token: Token, value: string) => {
    recalcFromPay(token, parseFloat(value) || 0)
  }

  const onReceiveValueChange = (token: Token, value: string) => {
    recalcFromReceive(token, parseFloat(value) || 0)
  }

  // Half/Max helpers for UI components
  const onPayHalf = (token: Token, balanceStr?: string) => {
    const bal = balanceStr ? parseFloat(balanceStr) || 0 : 0
    onPayValueChange(token, (bal / 2).toString())
  }

  const onPayMax = (token: Token, balanceStr?: string) => {
    const bal = balanceStr ? parseFloat(balanceStr) || 0 : 0
    onPayValueChange(token, bal.toString())
  }

  const onReceiveHalf = (token: Token, balanceStr?: string) => {
    const bal = balanceStr ? parseFloat(balanceStr) || 0 : 0
    onReceiveValueChange(token, (bal / 2).toString())
  }

  const onReceiveMax = (token: Token, balanceStr?: string) => {
    const bal = balanceStr ? parseFloat(balanceStr) || 0 : 0
    onReceiveValueChange(token, bal.toString())
  }

  const onPayTokenChange = (newToken: Token) => {
    const currentValue =
      payValues[newToken] ||
      convert(
        receiveValues[activeReceiveToken] || 0,
        activeReceiveToken,
        newToken,
      )
    recalcFromPay(newToken, currentValue)
  }

  const onReceiveTokenChange = (newToken: Token) => {
    const currentValue =
      receiveValues[newToken] ||
      convert(payValues[activePayToken] || 0, activePayToken, newToken)
    recalcFromReceive(newToken, currentValue)
  }

  const onBothSelectedChange = (selected: boolean) => {
    setBothSelected(selected)
    setPayValues(createInitialRecord())
    setReceiveValues(createInitialRecord())
  }

  const onHalfClick = (t: Token) => {
    if (config.pay.includes(t)) {
      onPayHalf(t, wallet?.balance[t as keyof typeof wallet.balance]?.toString())
    } else if (config.receive.includes(t)) {
      onReceiveHalf(t, wallet?.balance[t as keyof typeof wallet.balance]?.toString())
    }
  }
  
  const onMaxClick = (t: Token) => {
    if (config.pay.includes(t)) {
      onPayMax(t, wallet?.balance[t as keyof typeof wallet.balance]?.toString())
    } else if (config.receive.includes(t)) {
      onReceiveMax(t, wallet?.balance[t as keyof typeof wallet.balance]?.toString())
    }
  }

  const onButtonClick = () => {
    console.log("Button clicked for", actionType)
    console.log("Pay values:", payValues)
    console.log("Receive values:", receiveValues)
  }

  return {
    config,
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
  }
}
