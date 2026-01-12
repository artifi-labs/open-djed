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
  onButtonClick?: () => void
  linkClicked?: boolean
  onLinkClick?: () => void
  maxAmount?: number
  inputStatus: InputStatus
  hasMaxAmount?: boolean
  minWarningMessage?: string
  minMessage?: string
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
  linkClicked,
  onLinkClick,
  maxAmount,
  hasMaxAmount,
  inputStatus,
  minWarningMessage,
  minMessage,
}) => {
  const { reserveBounds } = useReserveDetails()

  const actionText = capitalize(actionType)

  const payEmpty = Object.values(payValues).every(isEmptyValue)
  const receiveEmpty = Object.values(receiveValues).every(isEmptyValue)

  const buttonControls = React.useMemo(() => {
    const token = actionType === "Mint" ? activeReceiveToken : activePayToken

    const disabledDueToReserve =
      ((token === "DJED" && actionType === "Mint") ||
        (token === "SHEN" && actionType === "Burn")) &&
      reserveBounds === "below"
        ? true
        : token === "SHEN" && actionType === "Mint" && reserveBounds === "above"
          ? true
          : false

    const isDisabled =
      (hasWalletConnected && (payEmpty || receiveEmpty)) || disabledDueToReserve

    const text = !hasWalletConnected
      ? `Connect Wallet to ${actionText}`
      : payEmpty || receiveEmpty
        ? `Fill in the Amount to ${actionText}`
        : `${actionText} ${minMessage}`
    return { isDisabled, text }
  }, [hasWalletConnected, actionType, payValues, receiveValues])

  const inputs = [
    {
      key: "pay",
      label: "You Pay",
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
      hasMaxAndHalfActions: true,
      hasAvailableAmount: actionType === "Mint" ? true : false,
      hasMaxAmount: hasMaxAmount,
      maxAmount: maxAmount,
      inputStatus: inputStatus,
      disable: false,
    },
    {
      key: "receive",
      label: "You Receive",
      coins: config.receive,
      hasLeadingIcon: !bothSelected && config.receiveHasLeadingIcon,
      showDual: config.receiveShowDual && bothSelected,
      showCheckbox: config.receiveShowDual,
      activeToken: activeReceiveToken,
      values: receiveValues,
      onTokenChange: onReceiveTokenChange,
      onValueChange: onReceiveValueChange,
      onHalfClick,
      onMaxClick,
      hasMaxAndHalfActions: true,
      hasAvailableAmount: actionType === "Mint" ? false : true,
      hasMaxAmount: hasMaxAmount,
      maxAmount: maxAmount,
      inputStatus: inputStatus,
      disabled: false,
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
          linkClicked={linkClicked}
          onLinkClick={onLinkClick}
          hasMaxAndHalfActions={i.hasMaxAndHalfActions}
          hasAvailableAmount={i.hasAvailableAmount}
          disabled={i.disabled}
          hasMaxAmount={i.hasMaxAmount}
          maxAmount={i.maxAmount}
          inputStatus={inputStatus}
          minWarningMessage={minWarningMessage}
        />
      ))}

      <Button
        variant="secondary"
        size="medium"
        text={buttonControls.text}
        disabled={buttonControls.isDisabled}
        onClick={onButtonClick}
      />
    </div>
  )
}

export default Action
