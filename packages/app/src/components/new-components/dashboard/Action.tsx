"use client"

import * as React from "react"
import Button from "../Button"
import { capitalize } from "@/lib/utils"
import { ActionType } from "./actionConfig"
import InputAction from "./InputAction"
import { Token } from "@/lib/tokens"

export type ActionProps = {
  actionType: ActionType
  hasWalletConnected: boolean
  config: {
    pay: Token[]
    receive: Token[]
    payHasLeadingIcon: boolean
    receiveHasLeadingIcon: boolean
    payShowDual: boolean
    receiveShowDual: boolean
  }
  bothSelected: boolean
  setBothSelected: (v: boolean) => void
  payValues: Record<Token, number>
  receiveValues: Record<Token, number>
  activePayToken: Token
  activeReceiveToken: Token
  onPayValueChange: (token: Token, value: string) => void
  onReceiveValueChange: (token: Token, value: string) => void
  onPayTokenChange: (token: Token) => void
  onReceiveTokenChange: (token: Token) => void
  onButtonClick?: () => void
}

const Action: React.FC<ActionProps> = ({
  actionType,
  hasWalletConnected,
  config,
  bothSelected,
  setBothSelected,
  payValues,
  receiveValues,
  activePayToken,
  activeReceiveToken,
  onPayValueChange,
  onReceiveValueChange,
  onPayTokenChange,
  onReceiveTokenChange,
  onButtonClick,
}) => {
  const actionText = capitalize(actionType)

  const payEmpty = Object.values(payValues).every((v) => !v || v === "0")
  const receiveEmpty = Object.values(receiveValues).every(
    (v) => !v || v === "0",
  )

  const buttonText = !hasWalletConnected
    ? `Connect Wallet to ${actionText}`
    : payEmpty || receiveEmpty
      ? `Fill in the Amount to ${actionText}`
      : actionText

  return (
    <div className="flex flex-col gap-24">
      <InputAction
        label="You Receive"
        coins={config.receive}
        hasLeadingIcon={!bothSelected && config.receiveHasLeadingIcon}
        showDual={config.receiveShowDual && bothSelected}
        activeToken={activeReceiveToken}
        values={receiveValues}
        onTokenChange={onReceiveTokenChange}
        onValueChange={onReceiveValueChange}
        showCheckbox
        checkboxLabel={`${actionText} both (DJED & SHEN)`}
        checkboxChecked={bothSelected}
        onCheckboxChange={setBothSelected}
      />

      <InputAction
        label="You Pay"
        coins={config.pay}
        hasLeadingIcon={!bothSelected && config.payHasLeadingIcon}
        showDual={config.payShowDual && bothSelected}
        activeToken={activePayToken}
        values={payValues}
        onTokenChange={onPayTokenChange}
        onValueChange={onPayValueChange}
      />

      <Button
        variant="secondary"
        size="medium"
        text={buttonText}
        disabled={hasWalletConnected && (payEmpty || receiveEmpty)}
        onClick={onButtonClick}
      />
    </div>
  )
}

export default Action
