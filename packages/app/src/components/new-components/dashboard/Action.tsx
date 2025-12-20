"use client"

import * as React from "react"
import Button from "../Button"
import { capitalize } from "@/lib/utils"
import { ActionType } from "./actionConfig"
import InputAction from "./InputAction"
import { Token } from "@/lib/tokens"
import { ReserveBoundsType } from "./useMintBurnAction"

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
  payValues: Record<Token, number>
  receiveValues: Record<Token, number>
  activePayToken: Token
  activeReceiveToken: Token
  onPayValueChange: (t: Token, value: string) => void
  onReceiveValueChange: (t: Token, value: string) => void
  onPayTokenChange: (t: Token) => void
  onReceiveTokenChange: (t: Token) => void
  onHalfClick?: (t: Token, maxAmount: string) => void
  onMaxClick?: (t: Token, maxAmount: string) => void
  onButtonClick?: () => void
  linkClicked?: boolean
  onLinkClick?: () => void
  reserveDetails: () => {
    maxRatio: number
    minRatio: number
    reserveRatio: number
    reserveBounds: ReserveBoundsType
    reserveWarning: string | null
  }
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
  reserveDetails,
}) => {
  const actionText = capitalize(actionType)

  const payEmpty = Object.values(payValues).every((v) => !v || v === 0)
  const receiveEmpty = Object.values(receiveValues).every((v) => !v || v === 0)

  const buttonText = !hasWalletConnected
    ? `Connect Wallet to ${actionText}`
    : payEmpty || receiveEmpty
      ? `Fill in the Amount to ${actionText}`
      : actionText

  const { reserveBounds } = reserveDetails()

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
      hasMaxAndHalfActions: true,
      hasAvailableAmount: false,
      hasMaxAmount: true,
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
    <div className="flex flex-col gap-24">
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
          action={actionType}
          reserveBounds={reserveBounds}
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
