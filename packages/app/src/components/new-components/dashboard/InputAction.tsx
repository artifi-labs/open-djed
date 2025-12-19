"use client"

import * as React from "react"
import Checkbox from "../Checkbox"
import TransactionInput from "../TransactionInput"
import ButtonIcon from "../ButtonIcon"
import { useWallet } from "@/context/WalletContext"
import { Token } from "@/lib/tokens"

export type InputActionProps = {
  label: string
  coins: Token[]
  hasLeadingIcon: boolean
  showDual: boolean
  activeToken: Token
  values: Record<Token, number>
  onTokenChange: (t: Token) => void
  onValueChange: (t: Token, v: string) => void
  onHalfClick?: (t: Token) => void
  onMaxClick?: (t: Token) => void
  showCheckbox?: boolean
  checkboxLabel?: string
  checkboxChecked?: boolean
  onCheckboxChange?: (v: boolean) => void
  linkClicked?: boolean
  onLinkClick?: () => void
  hasMaxAndHalfActions?: boolean
}

export type TransactionInputGroupProps = {
  coins: Token[]
  activeToken: Token
  values: Record<Token, number>
  hasLeadingIcon: boolean
  showDual: boolean
  onTokenChange: (t: Token) => void
  onValueChange: (t: Token, v: string) => void
  onHalfClick?: (t: Token) => void
  onMaxClick?: (t: Token) => void
  linkClicked?: boolean
  onLinkClick?: () => void
  hasMaxAndHalfActions?: boolean
}

const TransactionInputGroup: React.FC<TransactionInputGroupProps> = ({
  coins,
  activeToken,
  values,
  hasLeadingIcon,
  showDual,
  onTokenChange,
  onValueChange,
  onHalfClick,
  onMaxClick,
  linkClicked,
  onLinkClick,
  hasMaxAndHalfActions,
}) => {
  const { wallet } = useWallet()
  const walletConnected = wallet !== null

  const renderInput = (coin: Token) => {
    const handleTokenChange = () => {
      const currentIndex = coins.indexOf(coin)
      const nextIndex = (currentIndex + 1) % coins.length
      onTokenChange(coins[nextIndex])
    }
    const balanceStr = walletConnected
      ? wallet?.balance[coin as keyof typeof wallet.balance]?.toString()
      : undefined
    return (
      <TransactionInput
        key={coin}
        placeholder="0"
        asset={{
          coin: coin,
          coins,
          size: "small",
          checked: false,
          hasLeadingIcon,
          onCoinChange: handleTokenChange,
        }}
        assetIcon="Switch"
        value={values[coin] ? values[coin].toString() : ""}
        onValueChange={(v) => onValueChange(coin, v)}
        amount={balanceStr}
        onHalfClick={onHalfClick ? () => onHalfClick(coin) : undefined}
        onMaxClick={onMaxClick ? () => onMaxClick(coin) : undefined}
        hasMaxAndHalfActions={hasMaxAndHalfActions}
      />
    )
  }

  if (!showDual) return renderInput(activeToken)

  return (
    <div className="flex gap-8">
      {coins.map((coin, index) => {
        return (
          <React.Fragment key={coin}>
            {renderInput(coin)}

            {/* LINK BUTTON */}
            {index === 0 && (
              <ButtonIcon
                icon="Unlink"
                size="medium"
                variant="onlyIcon"
                onClick={onLinkClick}
                active={linkClicked}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const InputAction: React.FC<InputActionProps> = ({
  label,
  coins,
  hasLeadingIcon,
  showDual,
  activeToken,
  values,
  onTokenChange,
  onValueChange,
  onHalfClick,
  onMaxClick,
  showCheckbox,
  checkboxLabel,
  checkboxChecked,
  onCheckboxChange,
  linkClicked,
  onLinkClick,
  hasMaxAndHalfActions,
}) => {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between">
        <p className="text-xxs text-secondary font-medium">{label}</p>

        {showCheckbox && checkboxLabel && (
          <div className="flex items-center gap-8">
            <Checkbox
              size={24}
              order={["Deselected", "Selected"]}
              defaultType={checkboxChecked ? "Selected" : "Deselected"}
              onStateChange={(s) => onCheckboxChange?.(s === "Selected")}
            />
            <p className="text-secondary text-xxs font-medium">
              {checkboxLabel}
            </p>
          </div>
        )}
      </div>

      <TransactionInputGroup
        coins={coins}
        activeToken={activeToken}
        values={values}
        hasLeadingIcon={hasLeadingIcon}
        showDual={showDual}
        onTokenChange={onTokenChange}
        onValueChange={onValueChange}
        onHalfClick={onHalfClick}
        onMaxClick={onMaxClick}
        linkClicked={linkClicked}
        onLinkClick={onLinkClick}
        hasMaxAndHalfActions={hasMaxAndHalfActions}
      />
    </div>
  )
}

export default InputAction
