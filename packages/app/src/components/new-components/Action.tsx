import * as React from "react"
import clsx from "clsx"
import Button from "./Button"
import { capitalize } from "@/lib/utils"
import Checkbox from "./Checkbox"
import TransactionInput from "./TransactionInput"
import { IconCoinName } from "./Coin"
import { AssetProps } from "./Asset"

type ActionType = "mint" | "burn"

export type ActionProps = {
  actionType: ActionType
  bothSelectable?: boolean
  hasWalletConnected: boolean
}

type InputActionProps = {
  actionType: ActionType
  label: string
  bothSelectable?: boolean
  defaultToken: IconCoinName
  placeholderValue?: number
  tokenValue: number // CHANGE THIS KEY
  asset?: AssetProps
  inputDisabled?: boolean
}

const InputAction: React.FC<InputActionProps> = ({
  actionType,
  label,
  bothSelectable = false,
  defaultToken,
  placeholderValue = 0.00,
  tokenValue = 0.00, // CHANGE THIS KEY I think i should use a context to get this values (user wallet)
  asset,
  inputDisabled = false,
}) => {
  return(
    <div className="flex flex-col gap-12">
      <div className="flex flex-row justify-between">
        <p className="text-xxs text-secondary font-medium">{label}</p>
        {bothSelectable && (
          <div className="flex flex-row gap-8 items-center">
            <Checkbox 
              defaultType="Deselected"
              order={["Deselected", "Selected"]}
              size={24}
            />
            <p className="text-secondary font-medium text-xxs">{capitalize(actionType)} both (DJED & SHEN)</p>
          </div>
        )}
      </div>
      <TransactionInput
        placeholder={placeholderValue.toString()} // TODO CHANGE TO NUMBER
        suffix={`$${tokenValue}`}
        asset={asset}
        inputDisabled={inputDisabled}
      />
    </div>
  )
}

const Action: React.FC<ActionProps> = ({
  actionType,
  hasWalletConnected = false,
}) => {
  const actionTypeText = capitalize(actionType)
  const buttonText = hasWalletConnected ? actionTypeText : "Connect Wallet to " + actionTypeText

  const actionCoins: Record<ActionType, { pay: IconCoinName[]; receive: IconCoinName[] }> = {
    mint: {
      pay: ["ADA"], 
      receive: ["DJED", "SHEN"] 
    },
    burn: { 
      pay: ["DJED", "SHEN"], 
      receive: ["ADA"],
    },
  }

  const payAsset: AssetProps = {
    coin: actionType === "mint" ? actionCoins.mint.pay[0] : actionCoins.burn.pay[0],
    checked: false,
    size: "small",
    hasLeadingIcon: actionType === "burn" ? true : false,
  }

  const receiveAsset: AssetProps = {
    coin: actionType === "mint" ? actionCoins.mint.receive[0] : actionCoins.burn.receive[0],
    checked: false,
    size: "small",
    hasLeadingIcon: actionType === "mint" ? true : false,
  }
  
  return (
    <>
      <div className="flex flex-col gap-24">
        {/* Receive */}
        <InputAction
          actionType={actionType}
          label={"You Receive"}
          bothSelectable={true}
          defaultToken={"DJED"}
          tokenValue={0.00}
          asset={receiveAsset}
          inputDisabled={true}
        />
        {/* PAY */}
        <InputAction
          actionType={actionType}
          label={"You Pay"}
          defaultToken={"ADA"}
          tokenValue={0.00}
          asset={payAsset}
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
