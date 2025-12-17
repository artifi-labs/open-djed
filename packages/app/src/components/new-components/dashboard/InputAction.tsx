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
        value={values[coin] ? values[coin].toString() : ""}
        onValueChange={(v) => onValueChange(coin, v)}
        hasMaxAndHalfActions={walletConnected}
        amount={balanceStr}
        onHalfClick={onHalfClick ? () => onHalfClick(coin) : undefined}
        onMaxClick={onMaxClick ? () => onMaxClick(coin) : undefined}
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
            {index === 0 && (
              <ButtonIcon icon="Unlink" size="medium" variant="onlyIcon" />
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
      />
    </div>
  )
}

export default InputAction
