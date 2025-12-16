import * as React from "react"
import { IconCoinName } from "../Coin"
import { ACTION_CONFIG, ActionType } from "./actionConfig"

const convert = (amount: number, from: string, to: string): number => {
  if (from === "ADA" && to === "DJED") return amount * 2
  if (from === "ADA" && to === "SHEN") return amount * 1.5
  if (from === "DJED" && to === "ADA") return amount / 2
  if (from === "SHEN" && to === "ADA") return amount / 1.5
  return amount
}

export function useMintBurnAction(actionType: ActionType) {
  const config = ACTION_CONFIG[actionType]
  const isMint = actionType === "mint"

  const [bothSelected, setBothSelected] = React.useState(false)
  const [payValues, setPayValues] = React.useState<Record<string, string>>({})
  const [receiveValues, setReceiveValues] = React.useState<
    Record<string, string>
  >({})
  const [activePayToken, setActivePayToken] = React.useState<IconCoinName>(
    config.pay[0],
  )
  const [activeReceiveToken, setActiveReceiveToken] =
    React.useState<IconCoinName>(config.receive[0])

  const calculateTotalInADA = (
    tokens: IconCoinName[],
    values: Record<string, string>,
  ) => {
    return tokens.reduce((acc, token) => {
      const v = parseFloat(values[token] || "0") || 0
      return acc + convert(v, token, "ADA")
    }, 0)
  }

  const distributeFromTotal = (
    total: number,
    targetTokens: IconCoinName[],
    isDual: boolean,
  ): Record<string, string> => {
    const result: Record<string, string> = {}
    if (isDual && targetTokens.length > 1) {
      const split = total / targetTokens.length
      targetTokens.forEach((token) => {
        result[token] = convert(split, "ADA", token).toString()
      })
    } else {
      const activeToken = isDual ? config.receive[0] : activePayToken
      result[activeToken] = convert(total, "ADA", activeToken).toString()
    }
    return result
  }

  React.useEffect(() => {
    setBothSelected(false)
    setPayValues({})
    setReceiveValues({})
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [actionType, config.pay, config.receive])

  const recalcFromPay = (token: IconCoinName, value: number) => {
    const nextPay = { ...payValues, [token]: value.toString() }
    const nextReceive: Record<string, string> = {}

    if (bothSelected && isMint && config.receive.length > 1) {
      const split = value / config.receive.length
      config.receive.forEach((rc) => {
        nextReceive[rc] = convert(split, token, rc).toString()
      })
    } else {
      nextReceive[activeReceiveToken] = convert(
        value,
        token,
        activeReceiveToken,
      ).toString()
    }

    setActivePayToken(token)
    setPayValues(nextPay)
    setReceiveValues(nextReceive)
  }

  const recalcFromReceive = (token: IconCoinName, value: number) => {
    const nextReceive = { ...receiveValues, [token]: value.toString() }
    const nextPay: Record<string, string> = {}

    if (bothSelected && !isMint && config.pay.length > 1) {
      config.pay.forEach((pc) => {
        const total = config.receive.reduce((acc, rc) => {
          const v = parseFloat(nextReceive[rc] || "0") || 0
          return acc + convert(v, rc, pc)
        }, 0)
        nextPay[pc] = total.toString()
      })
    } else {
      nextPay[activePayToken] = convert(value, token, activePayToken).toString()
    }

    setActiveReceiveToken(token)
    setReceiveValues(nextReceive)
    setPayValues(nextPay)
  }

  const onPayValueChange = (token: IconCoinName, value: string) => {
    console.log("onPayValueChange", token, value)
    const nextPay = { ...payValues, [token]: value }
    const totalPay = calculateTotalInADA(config.pay, nextPay)
    const nextReceive = distributeFromTotal(
      totalPay,
      config.receive,
      bothSelected && isMint && config.receive.length > 1,
    )

    setPayValues(nextPay)
    setReceiveValues(nextReceive)
  }

  const onReceiveValueChange = (token: IconCoinName, value: string) => {
    console.log("onReceiveValueChange", token, value)
    const nextReceive = { ...receiveValues, [token]: value }
    const totalReceive = calculateTotalInADA(config.receive, nextReceive)
    const nextPay = distributeFromTotal(
      totalReceive,
      config.pay,
      bothSelected && !isMint && config.pay.length > 1,
    )

    setReceiveValues(nextReceive)
    setPayValues(nextPay)
  }

  const onPayTokenChange = (newToken: IconCoinName) => {
    console.log("newToken", newToken)

    let currentValue = parseFloat(payValues[newToken] || "0") || 0
    if (!payValues[newToken]) {
      const receiveValue =
        parseFloat(receiveValues[activeReceiveToken] || "0") || 0
      currentValue = convert(receiveValue, activeReceiveToken, newToken)
    }
    recalcFromPay(newToken, currentValue)
  }

  const onReceiveTokenChange = (newToken: IconCoinName) => {
    console.log(newToken)
    let currentValue = parseFloat(receiveValues[newToken] || "0") || 0
    if (!receiveValues[newToken]) {
      const payValue = parseFloat(payValues[activePayToken] || "0") || 0
      currentValue = convert(payValue, activePayToken, newToken)
    }
    recalcFromReceive(newToken, currentValue)
  }

  const onBothSelectedChange = (selected: boolean) => {
    setBothSelected(selected)
    setPayValues({})
    setReceiveValues({})
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
    onButtonClick,
  }
}
