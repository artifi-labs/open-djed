/**
 * Action flow for mint and burn operations.
 * Handles Pay / Receive inputs and optional DJED + SHEN ("both") mode.
 * Input structure (single vs dual) is derived from action type and checkbox state.
 */
import * as React from "react"
import Button from "./Button"
import { capitalize } from "@/lib/utils"
import Checkbox, { CheckboxType } from "./Checkbox"
import TransactionInput from "./TransactionInput"
import { IconCoinName } from "./Coin"
import { AssetProps } from "./Asset"
import ButtonIcon from "./ButtonIcon"
import { useWallet } from "@/context/WalletContext"

/**
 * Supported action types.
 * - mint: ADA -> DJED / SHEN
 * - burn: DJED / SHEN -> ADA
 */
type ActionType = "mint" | "burn"

export type ActionProps = {
  actionType: ActionType
  defaultBothSelectable?: boolean
  hasWalletConnected: boolean
}

type InputActionProps = {
  label: string
  asset: AssetProps
  placeholderValue?: number
  tokenValue?: number
  inputDisabled?: boolean
  showCheckbox?: boolean
  checkboxLabel?: string
  checkboxChecked?: boolean
  showDualInput?: boolean
  onCheckboxChange?: (checked: boolean) => void
}

/**
 * Static configuration for each action type.
 * Defines which assets are paid/received and
 * when dual inputs should be shown.
 */
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

/**
 * Hook that encapsulates all state and derived data
 * for the Action component.
 *
 * Responsibilities:
 * - Manage `bothSelected` state
 * - Resolve pay / receive assets
 * - Decide when dual inputs should be shown
 */
const useActionState = (
  actionType: ActionType,
  defaultBothSelectable: boolean,
) => {
  const [bothSelected, setBothSelected] = React.useState(defaultBothSelectable)

  const config = ACTION_CONFIG[actionType]

  const createAsset = (
    coins: IconCoinName[],
    hasLeadingIcon: boolean,
  ): AssetProps => ({
    coins: coins,
    coin: coins[0],
    checked: false,
    size: "small",
    hasLeadingIcon: !bothSelected && hasLeadingIcon,
  })

  const payAsset = createAsset(config.pay, config.payHasLeadingIcon)
  const receiveAsset = createAsset(config.receive, config.receiveHasLeadingIcon)
  const payShowDual = config.payShowDual && bothSelected
  const receiveShowDual = config.receiveShowDual && bothSelected

  return {
    bothSelected,
    setBothSelected,
    payAsset,
    receiveAsset,
    payShowDual,
    receiveShowDual,
  }
}

/**
 * Renders one or two TransactionInput components.
 * Used when "both" mode is enabled.
 */
const TransactionInputGroup: React.FC<{
  showDual: boolean
  asset: AssetProps
  placeholderValue: number
  tokenValue: number
  inputDisabled: boolean
}> = ({ showDual, asset, placeholderValue, tokenValue, inputDisabled }) => {
  const { wallet } = useWallet()

  if (!showDual) {
    return (
      <TransactionInput
        placeholder={placeholderValue.toString()}
        suffix={`$${tokenValue.toFixed(2)}`}
        asset={asset}
        inputDisabled={inputDisabled}
        hasMaxAndHalfActions={wallet !== null}
        amount="0.00"
      />
    )
  }

  return (
    <div className="flex flex-row gap-2">
      <TransactionInput
        placeholder={placeholderValue.toString()}
        suffix={`$${tokenValue.toFixed(2)}`}
        asset={{
          ...asset,
          coin: asset.coins[0],
        }}
        inputDisabled={inputDisabled}
        hasMaxAndHalfActions={wallet !== null}
        amount="0.00"
      />
      <ButtonIcon icon="Unlink" size="medium" variant="onlyIcon" />
      <TransactionInput
        placeholder={placeholderValue.toString()}
        suffix={`$${tokenValue.toFixed(2)}`}
        asset={{
          ...asset,
          coin: asset.coins[1],
        }}
        inputDisabled={inputDisabled}
        hasMaxAndHalfActions={wallet !== null}
        amount="0.00"
      />
    </div>
  )
}

/**
 * Displays a labeled input section with optional checkbox.
 */
const InputAction: React.FC<InputActionProps> = ({
  label,
  asset,
  placeholderValue = 0.0,
  tokenValue = 0.0,
  inputDisabled = false,
  showCheckbox = false,
  checkboxLabel,
  checkboxChecked = false,
  showDualInput = false,
  onCheckboxChange,
}) => {
  const handleCheckboxChange = (state: CheckboxType) => {
    onCheckboxChange?.(state === "Selected")
  }

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
        showDual={showDualInput}
        asset={asset}
        placeholderValue={placeholderValue}
        tokenValue={tokenValue}
        inputDisabled={inputDisabled}
      />
    </div>
  )
}

/**
 * Main Action component.
 * Orchestrates mint/burn flows, checkbox state,
 * and renders Pay / Receive inputs.
 */
const Action: React.FC<ActionProps> = ({
  actionType,
  defaultBothSelectable = false,
  hasWalletConnected = false,
}) => {
  const {
    bothSelected,
    setBothSelected,
    payAsset,
    receiveAsset,
    payShowDual,
    receiveShowDual,
  } = useActionState(actionType, defaultBothSelectable)

  const actionTypeText = capitalize(actionType)
  const buttonText = hasWalletConnected
    ? actionTypeText
    : `Connect Wallet to ${actionTypeText}`

  const checkboxLabel = `${capitalize(actionType)} both (DJED & SHEN)`

  return (
    <>
      <div className="flex flex-col gap-24">
        <InputAction
          label="You Receive"
          asset={receiveAsset}
          tokenValue={0.0}
          inputDisabled={true}
          showCheckbox={true}
          checkboxLabel={checkboxLabel}
          checkboxChecked={bothSelected}
          onCheckboxChange={setBothSelected}
          showDualInput={receiveShowDual}
        />

        <InputAction
          label="You Pay"
          asset={payAsset}
          tokenValue={0.0}
          showDualInput={payShowDual}
        />
      </div>

      <Button
        id={`${actionType}-submit-button`}
        variant="secondary"
        size="medium"
        text={buttonText}
      />
    </>
  )
}

export default Action
