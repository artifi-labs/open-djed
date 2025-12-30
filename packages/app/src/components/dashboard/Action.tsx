"use client"

import * as React from "react"
import Button from "../Button"
import { capitalize, isEmptyValue } from "@/lib/utils"
import type { ActionType } from "./actionConfig"
import InputAction from "./InputAction"
import type { Token } from "@/lib/tokens"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { type InputStatus } from "../input-fields/TransactionInput"

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
  onBothSelectedChange: (v: boolean) => void
  payValues: Record<Token, string>
  receiveValues: Record<Token, string>
  activePayToken: Token
  activeReceiveToken: Token
  onPayValueChange: (t: Token, value: string) => void
  onReceiveValueChange: (t: Token, value: string) => void
  onPayTokenChange: (t: Token) => void
  onReceiveTokenChange: (t: Token) => void
  onHalfClick?: (t: Token) => void
  onMaxClick?: (t: Token) => void
  onMinClick?: (t: Token) => void
  onButtonClick?: () => void
  linkClicked?: boolean
  onLinkClick?: () => void
  maxAmount?: number
  inputStatus: InputStatus
  hasMaxAmount?: boolean
}

const Action: React.FC<ActionProps> = ({
  actionType,
  hasWalletConnected,
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
  onHalfClick,
  onMaxClick,
  onMinClick,
  linkClicked,
  onLinkClick,
  maxAmount,
  hasMaxAmount,
  inputStatus,
}) => {
  const actionText = capitalize(actionType)

  const payEmpty = Object.values(payValues).every(isEmptyValue)
  const receiveEmpty = Object.values(receiveValues).every(isEmptyValue)

  const buttonText = !hasWalletConnected
    ? `Connect Wallet to ${actionText}`
    : payEmpty || receiveEmpty
      ? `Fill in the Amount to ${actionText}`
      : actionText

  const { reserveBounds } = useReserveDetails()

  const inputs = [
    {
      key: "pay",
      label: actionType === "Mint" ? "You Mint" : "You Burn",
      coins: config.pay,
      hasLeadingIcon: !bothSelected && config.payHasLeadingIcon,
      showDual: config.payShowDual && bothSelected,
      showCheckbox: config.payShowDual,
      activeToken: activePayToken,
      values: payValues,
      onTokenChange: onPayTokenChange,
      onValueChange: onPayValueChange,
      onHalfClick,
      onMaxClick,
      onMinClick,
      hasMaxAndHalfActions: true,
      hasAvailableAmount: false,
      hasMaxAmount: hasMaxAmount,
      maxAmount: maxAmount,
      inputStatus: inputStatus,
    },
    {
      key: "receive",
      label: actionType === "Mint" ? "You Pay" : "You Receive",
      coins: config.receive,
      hasLeadingIcon: !bothSelected && config.receiveHasLeadingIcon,
      showDual: config.receiveShowDual && bothSelected,
      showCheckbox: config.receiveShowDual,
      activeToken: activeReceiveToken,
      values: receiveValues,
      onTokenChange: onReceiveTokenChange,
      onValueChange: onReceiveValueChange,
      hasMaxAndHalfActions: false,
      hasAvailableAmount: false,
      disabled: true,
    },
  ]

  return (
    <div className="desktop:gap-24 flex flex-col gap-18">
      {inputs.map((i) => (
        <InputAction
          key={i.key}
          label={i.label}
          coins={i.coins}
          hasLeadingIcon={i.hasLeadingIcon}
          showDual={i.showDual}
          showCheckbox={i.showCheckbox}
          checkboxLabel={`${actionText} both (DJED & SHEN)`}
          checkboxChecked={bothSelected}
          onCheckboxChange={onBothSelectedChange}
          activeToken={i.activeToken}
          values={i.values}
          onTokenChange={i.onTokenChange}
          onValueChange={i.onValueChange}
          onHalfClick={i.onHalfClick}
          onMaxClick={i.onMaxClick}
          onMinClick={i.onMinClick}
          linkClicked={linkClicked}
          onLinkClick={onLinkClick}
          hasMaxAndHalfActions={i.hasMaxAndHalfActions}
          hasAvailableAmount={i.hasAvailableAmount}
          disabled={i.disabled}
          hasMaxAmount={i.hasMaxAmount}
          action={actionType}
          reserveBounds={reserveBounds}
          maxAmount={i.maxAmount}
          inputStatus={inputStatus}
        />
      ))}

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
