"use client"

import * as React from "react"
import Button from "../Button"
import { capitalize } from "@/lib/utils"
import Checkbox from "../Checkbox"
import TransactionInput from "../TransactionInput"
import ButtonIcon from "../ButtonIcon"
import { IconCoinName } from "../Coin"
import { AssetProps } from "../Asset"
import { useWallet } from "@/context/WalletContext"
import { useWalletSidebar } from "@/context/SidebarContext"

export type Type = "pay" | "receive"

export type ActionProps = {
  actionType: "mint" | "burn"
  hasWalletConnected: boolean
  bothSelected: boolean
  onBothSelectedChange: (selected: boolean) => void
  payValues: Record<string, string>
  receiveValues: Record<string, string>
  onInputChange: (token: IconCoinName, val: string, type: Type) => void
  activePayToken: IconCoinName
  activeReceiveToken: IconCoinName
  onActivePayTokenChange: (token: IconCoinName) => void
  onActiveReceiveTokenChange: (token: IconCoinName) => void
  payCoins: IconCoinName[]
  receiveCoins: IconCoinName[]
  payHasLeadingIcon: boolean
  receiveHasLeadingIcon: boolean
}

type InputHandler = {
  token: IconCoinName
  value: string
  onChange: (val: string) => void
}

type InputActionProps = {
  label: string
  asset: AssetProps
  showCheckbox?: boolean
  checkboxLabel?: string
  checkboxChecked?: boolean
  showDualInput?: boolean
  onCheckboxChange?: (checked: boolean) => void
  inputHandlers?: InputHandler[]
  inputDisabled?: boolean
  tokenValue?: number
}

const TransactionInputGroup: React.FC<{
  showDual: boolean
  asset: AssetProps
  inputHandlers?: InputHandler[]
  inputDisabled?: boolean
  tokenValue?: number
}> = ({
  showDual,
  asset,
  inputHandlers,
  inputDisabled = false,
  tokenValue = 0,
}) => {
  const { wallet } = useWallet()
  const walletConnected = wallet !== null

  const getInputValue = (val?: string) => (val && val !== "0" ? val : "")

  if (!showDual) {
    const handler = inputHandlers?.find((h) => h.token === asset.coin)
    return (
      <TransactionInput
        placeholder="0"
        suffix={`$${tokenValue.toFixed(2)}`}
        asset={asset}
        inputDisabled={inputDisabled}
        hasMaxAndHalfActions={walletConnected}
        amount={
          walletConnected
            ? wallet?.balance[
                asset.coin as keyof typeof wallet.balance
              ]?.toString()
            : undefined
        }
        value={getInputValue(handler?.value)}
        onValueChange={handler?.onChange}
        onAssetClick={() => asset.onCoinChange?.(asset.coin)}
      />
    )
  }

  return (
    <div className="flex flex-row gap-2">
      {asset.coins.map((coin, index) => {
        const handler = inputHandlers?.find((h) => h.token === coin)
        return (
          <React.Fragment key={coin}>
            <TransactionInput
              placeholder="0"
              suffix={`$${tokenValue.toFixed(2)}`}
              asset={{ ...asset, coin }}
              inputDisabled={inputDisabled}
              hasMaxAndHalfActions={walletConnected}
              amount={
                walletConnected
                  ? wallet?.balance[
                      coin as keyof typeof wallet.balance
                    ]?.toString()
                  : undefined
              }
              value={getInputValue(handler?.value)}
              onValueChange={(val) => handler?.onChange(val)}
            />
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
  asset,
  showCheckbox,
  checkboxLabel,
  checkboxChecked,
  showDualInput,
  onCheckboxChange,
  inputHandlers,
  inputDisabled,
  tokenValue,
}) => {
  const handleCheckboxChange = (state: string) =>
    onCheckboxChange?.(state === "Selected")

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-row justify-between">
        <p className="text-xxs text-secondary font-medium">{label}</p>
        {showCheckbox && checkboxLabel && (
          <div className="flex flex-row items-center gap-8">
            <Checkbox
              defaultType={checkboxChecked ? "Selected" : "Deselected"}
              order={["Deselected", "Selected"]}
              size={24}
              onStateChange={handleCheckboxChange}
            />
            <p className="text-secondary text-xxs font-medium">
              {checkboxLabel}
            </p>
          </div>
        )}
      </div>

      <TransactionInputGroup
        showDual={showDualInput ?? false}
        asset={asset}
        inputHandlers={inputHandlers}
        inputDisabled={inputDisabled}
        tokenValue={tokenValue}
      />
    </div>
  )
}

const Action: React.FC<ActionProps> = ({
  actionType,
  hasWalletConnected,
  bothSelected,
  onBothSelectedChange,
  payValues,
  receiveValues,
  onInputChange,
  activePayToken,
  activeReceiveToken,
  onActivePayTokenChange,
  onActiveReceiveTokenChange,
  payCoins,
  receiveCoins,
  payHasLeadingIcon,
  receiveHasLeadingIcon,
}) => {
  const { openWalletSidebar } = useWalletSidebar()
  const actionText = capitalize(actionType)
  const checkboxLabel = `${actionText} both (DJED & SHEN)`

  const showPayLeadingIcon = !bothSelected && payHasLeadingIcon
  const showReceiveLeadingIcon = !bothSelected && receiveHasLeadingIcon

  const generateInputHandlers = (
    coins: IconCoinName[],
    type: Type,
  ): InputHandler[] =>
    coins.map((coin) => ({
      token: coin,
      value: type === "pay" ? payValues[coin] || "" : receiveValues[coin] || "",
      onChange: (val) => onInputChange(coin, val, type),
    }))

  const [buttonText, setButtonText] = React.useState(
    `Connect Wallet to ${actionText}`,
  )

  React.useEffect(() => {
    if (!hasWalletConnected) {
      setButtonText(`Connect Wallet to ${actionText}`)
      return
    }
    const payEmpty = Object.values(payValues).every((v) => !v || v === "0")
    const receiveEmpty = Object.values(receiveValues).every(
      (v) => !v || v === "0",
    )
    setButtonText(
      payEmpty || receiveEmpty
        ? `Fill in the Amount to ${actionText}`
        : actionText,
    )
  }, [payValues, receiveValues, hasWalletConnected, actionText])

  const handleButtonClick = () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    console.log("Pay:", payValues)
    console.log("Receive:", receiveValues)
    console.log("Active Pay Token:", activePayToken)
    console.log("Active Receive Token:", activeReceiveToken)
    console.log("Both Selected:", bothSelected)
  }

  return (
    <div className="flex flex-col gap-24">
      <InputAction
        label="You Receive"
        asset={{
          coins: receiveCoins,
          coin: activeReceiveToken,
          size: "small",
          checked: false,
          hasLeadingIcon: showReceiveLeadingIcon,
          onCoinChange: onActiveReceiveTokenChange,
        }}
        showCheckbox
        checkboxLabel={checkboxLabel}
        checkboxChecked={bothSelected}
        onCheckboxChange={onBothSelectedChange}
        showDualInput={bothSelected && receiveCoins.length > 1}
        inputHandlers={generateInputHandlers(receiveCoins, "receive")}
        inputDisabled={false}
      />

      <InputAction
        label="You Pay"
        asset={{
          coins: payCoins,
          coin: activePayToken,
          size: "small",
          checked: false,
          hasLeadingIcon: showPayLeadingIcon,
          onCoinChange: onActivePayTokenChange,
        }}
        showDualInput={bothSelected && payCoins.length > 1}
        inputHandlers={generateInputHandlers(payCoins, "pay")}
      />

      <Button
        id={`${actionType}-submit-button`}
        variant="secondary"
        size="medium"
        text={buttonText}
        disabled={
          hasWalletConnected &&
          (Object.values(payValues).every((v) => !v || v === "0") ||
            Object.values(receiveValues).every((v) => !v || v === "0"))
        }
        onClick={handleButtonClick}
      />
    </div>
  )
}

export default Action
