"use client"

import * as React from "react"
import Checkbox from "../Checkbox"
import TransactionInput from "../TransactionInput"
import ButtonIcon from "../ButtonIcon"
import { IconCoinName } from "../Coin"
import { useWallet } from "@/context/WalletContext"

export type InputActionProps = {
  label: string
  coins: IconCoinName[]
  hasLeadingIcon: boolean
  showDual: boolean
  activeToken: IconCoinName
  values: Record<string, string>
  onTokenChange: (t: IconCoinName) => void
  onValueChange: (t: IconCoinName, v: string) => void
  showCheckbox?: boolean
  checkboxLabel?: string
  checkboxChecked?: boolean
  onCheckboxChange?: (v: boolean) => void
}

const TransactionInputGroup: React.FC<{
  coins: IconCoinName[]
  activeToken: IconCoinName
  values: Record<string, string>
  hasLeadingIcon: boolean
  showDual: boolean
  onTokenChange: (t: IconCoinName) => void
  onValueChange: (t: IconCoinName, v: string) => void
}> = ({
  coins,
  activeToken,
  values,
  hasLeadingIcon,
  showDual,
  onTokenChange,
  onValueChange,
}) => {
  const { wallet } = useWallet()
  const walletConnected = wallet !== null

  const renderInput = (coin: IconCoinName) => {
    const handleTokenChange = () => {
      const currentIndex = coins.indexOf(coin)
      const nextIndex = (currentIndex + 1) % coins.length
      onTokenChange(coins[nextIndex])
    }
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
        value={values[coin] && values[coin] !== "0" ? values[coin] : ""}
        onValueChange={(v) => onValueChange(coin, v)}
        hasMaxAndHalfActions={walletConnected}
        amount={
          walletConnected
            ? wallet?.balance[coin as keyof typeof wallet.balance]?.toString()
            : undefined
        }
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
      />
    </div>
  )
}

export default InputAction
