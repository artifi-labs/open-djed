"use client"

import * as React from "react"
import clsx from "clsx"
import BaseCard from "../card/BaseCard"
import Tabs, { TabItem } from "../Tabs"
import Action, { Type } from "./Action"
import { IconCoinName } from "../Coin"

type ActionType = "mint" | "burn"

export type ActionsProps = {
  defaultActionType: ActionType
  hasWalletConnected: boolean
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    pay: IconCoinName[]
    receive: IconCoinName[]
    payHasLeadingIcon: boolean
    receiveHasLeadingIcon: boolean
    receiveShowDual: boolean
    payShowDual: boolean
  }
> = {
  mint: {
    pay: ["ADA"],
    receive: ["DJED", "SHEN"],
    payHasLeadingIcon: false,
    receiveHasLeadingIcon: true,
    receiveShowDual: true,
    payShowDual: false,
  },
  burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    receiveShowDual: false,
    payShowDual: true,
  },
}

const convert = (amount: number, from: string, to: string): number => {
  if (from === "ADA" && to === "DJED") return amount * 2
  if (from === "ADA" && to === "SHEN") return amount * 1.5
  if (from === "DJED" && to === "ADA") return amount / 2
  if (from === "SHEN" && to === "ADA") return amount / 1.5
  return amount
}

const Actions: React.FC<ActionsProps> = ({
  defaultActionType,
  hasWalletConnected = false,
}) => {
  const [selectedAction, setSelectedAction] =
    React.useState<ActionType>(defaultActionType)
  const config = ACTION_CONFIG[selectedAction]

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

  React.useEffect(() => {
    setBothSelected(false)
    setPayValues({})
    setReceiveValues({})
    setActivePayToken(config.pay[0])
    setActiveReceiveToken(config.receive[0])
  }, [selectedAction, config.pay, config.receive])

  const handleInputChange = (token: IconCoinName, val: string, type: Type) => {
    const numVal = parseFloat(val) || 0
    let newPayValues = { ...payValues }
    let newReceiveValues = { ...receiveValues }

    if (type === "pay") {
      setActivePayToken(token)
      newPayValues[token] = val

      if (bothSelected) {
        newReceiveValues = {}
        config.receive.forEach((rc) => {
          const totalFromPays = config.pay.reduce((acc, payToken) => {
            const payAmount = parseFloat(newPayValues[payToken] || "0") || 0
            return acc + convert(payAmount, payToken, rc)
          }, 0)
          newReceiveValues[rc] = totalFromPays.toString()
        })
      } else {
        newReceiveValues[activeReceiveToken] = convert(
          numVal,
          token,
          activeReceiveToken,
        ).toString()
      }
    } else {
      setActiveReceiveToken(token)
      newReceiveValues[token] = val

      if (bothSelected) {
        newPayValues = {}
        config.pay.forEach((pc) => {
          const totalFromReceives = config.receive.reduce(
            (acc, receiveToken) => {
              const receiveAmount =
                parseFloat(newReceiveValues[receiveToken] || "0") || 0
              return acc + convert(receiveAmount, receiveToken, pc)
            },
            0,
          )
          newPayValues[pc] = totalFromReceives.toString()
        })
      } else {
        newPayValues[activePayToken] = convert(
          numVal,
          token,
          activePayToken,
        ).toString()
      }
    }

    setPayValues(newPayValues)
    setReceiveValues(newReceiveValues)
  }

  const handleBothSelectedChange = (selected: boolean) => {
    setBothSelected(selected)
    setPayValues({})
    setReceiveValues({})
  }

  const handleActivePayTokenChange = (token: IconCoinName) => {
    console.log("Active pay token change:", token)
    setActivePayToken(token)

    const converted = convert(
      receiveValues[activeReceiveToken]
        ? parseFloat(receiveValues[activeReceiveToken])
        : 0,
      activeReceiveToken,
      token,
    )
    setPayValues({
      ...payValues,
      [token]: converted.toString(),
    })
  }

  const handleActiveReceiveTokenChange = (token: IconCoinName) => {
    console.log("Active receive token change:", token)
    setActiveReceiveToken(token)

    const converted = convert(
      payValues[activePayToken] ? parseFloat(payValues[activePayToken]) : 0,
      activePayToken,
      token,
    )
    setReceiveValues({
      ...receiveValues,
      [token]: converted.toString(),
    })
  }

  /*const generateInputHandlers = (coins: IconCoinName[], type: Type) =>
    coins.map(coin => ({
      token: coin,
      value: type === "pay" ? payValues[coin] || "" : receiveValues[coin] || "",
      onChange: (val: string) => handleInputChange(coin, val, type)
    }))*/

  const descriptionText: Record<ActionType, string> = {
    mint: "Mint DJED, SHEN or both by depositing ADA into the protocol.",
    burn: "Burn DJED, SHEN or both to withdraw your ADA from the protocol.",
  }

  const ActionSelector: React.FC = () => {
    const tabs: TabItem[] = [
      { key: "mint", leadingIcon: "Mint", text: "Mint" },
      { key: "burn", leadingIcon: "Burn", text: "Burn" },
    ]

    return (
      <Tabs
        type={1}
        items={tabs}
        activeItemIndex={tabs.findIndex((t) => t.key === selectedAction)}
        onTabChange={(tab) => setSelectedAction(tab.key as ActionType)}
      />
    )
  }

  return (
    <BaseCard className={clsx("p-24")}>
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-12">
          <ActionSelector />
          <p className="text-tertiary text-xs">
            {descriptionText[selectedAction]}
          </p>
        </div>

        <Action
          actionType={selectedAction}
          hasWalletConnected={hasWalletConnected}
          bothSelected={bothSelected}
          onBothSelectedChange={handleBothSelectedChange}
          payValues={payValues}
          receiveValues={receiveValues}
          onInputChange={handleInputChange}
          activePayToken={activePayToken}
          activeReceiveToken={activeReceiveToken}
          onActivePayTokenChange={handleActivePayTokenChange}
          onActiveReceiveTokenChange={handleActiveReceiveTokenChange}
          payCoins={config.pay}
          receiveCoins={config.receive}
          payHasLeadingIcon={config.payHasLeadingIcon}
          receiveHasLeadingIcon={config.receiveHasLeadingIcon}
        />
      </div>
    </BaseCard>
  )
}

export default Actions
