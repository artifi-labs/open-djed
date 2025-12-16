"use client"

import * as React from "react"
import Button from "./Button"
import { capitalize } from "@/lib/utils"
import Checkbox from "./Checkbox"
import TransactionInput from "./TransactionInput"
import { IconCoinName } from "./Coin"
import { AssetProps } from "./Asset"
import ButtonIcon from "./ButtonIcon"
import { useWallet } from "@/context/WalletContext"
import { useWalletSidebar } from "@/context/SidebarContext"

type ActionType = "mint" | "burn"
type Type = "pay" | "receive"

export type ActionProps = {
  actionType: ActionType
  defaultBothSelectable?: boolean
  hasWalletConnected: boolean
}

type InputHandler = {
  token: string
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
  mint: { pay: ["ADA"], receive: ["DJED","SHEN"], payHasLeadingIcon: false, receiveHasLeadingIcon: true, receiveShowDual: true, payShowDual: false },
  burn: { pay: ["DJED","SHEN"], receive: ["ADA"], payHasLeadingIcon: true, receiveHasLeadingIcon: false, receiveShowDual: false, payShowDual: true },
}

const useActionState = (actionType: ActionType, defaultBothSelectable: boolean) => {
  const [bothSelected, setBothSelected] = React.useState(defaultBothSelectable)
  const config = ACTION_CONFIG[actionType]
  const createAsset = (coins: IconCoinName[], hasLeadingIcon: boolean): AssetProps => ({
    coins,
    coin: coins[0],
    checked: false,
    size: "small",
    hasLeadingIcon: !bothSelected && hasLeadingIcon,
  })
  return {
    bothSelected,
    setBothSelected,
    payAsset: createAsset(config.pay, config.payHasLeadingIcon),
    receiveAsset: createAsset(config.receive, config.receiveHasLeadingIcon),
    payShowDual: config.payShowDual && bothSelected,
    receiveShowDual: config.receiveShowDual && bothSelected,
  }
}

const convert = (amount: number, from: string, to: string): number => {
  if (from === "ADA" && to === "DJED") return amount * 2
  if (from === "ADA" && to === "SHEN") return amount * 1.5
  if (from === "DJED" && to === "ADA") return amount / 2
  if (from === "SHEN" && to === "ADA") return amount / 1.5
  return amount
}

const TransactionInputGroup: React.FC<{
  showDual: boolean
  asset: AssetProps
  inputHandlers?: InputHandler[]
  inputDisabled?: boolean
  tokenValue?: number
}> = ({ showDual, asset, inputHandlers, inputDisabled = false, tokenValue = 0 }) => {
  const { wallet } = useWallet()
  const walletConnected = wallet !== null

  const getInputValue = (val?: string) => val && val !== "0" ? val : ""

  if (!showDual) {
    const handler = inputHandlers?.find(h => h.token === asset.coin)
    return (
      <TransactionInput
        placeholder="0"
        suffix={`$${tokenValue.toFixed(2)}`}
        asset={asset}
        inputDisabled={inputDisabled}
        hasMaxAndHalfActions={walletConnected}
        amount={walletConnected ? wallet?.balance[asset.coin as keyof typeof wallet.balance]?.toString() : undefined}
        value={getInputValue(handler?.value)}
        onValueChange={handler?.onChange}
        onAssetClick={() => asset.onCoinChange?.(asset.coin)}
      />
    )
  }

  return (
    <div className="flex flex-row gap-2">
      {asset.coins.map((coin, idx) => {
        const handler = inputHandlers?.find(h => h.token === coin)
        return (
          <TransactionInput
            key={coin}
            placeholder="0"
            suffix={`$${tokenValue.toFixed(2)}`}
            asset={{ ...asset, coin }}
            inputDisabled={inputDisabled}
            hasMaxAndHalfActions={walletConnected}
            amount={walletConnected ? wallet?.balance[coin as keyof typeof wallet.balance]?.toString() : undefined}
            value={getInputValue(handler?.value)}
            onValueChange={val => handler?.onChange(val)}
          />
        )
      })}
      <ButtonIcon icon="Unlink" size="medium" variant="onlyIcon" />
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
  tokenValue
}) => {
  const handleCheckboxChange = (state: string) => onCheckboxChange?.(state === "Selected")

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-row justify-between">
        <p className="text-xxs text-secondary font-medium">{label}</p>
        {showCheckbox && checkboxLabel && (
          <div className="flex flex-row items-center gap-8">
            <Checkbox
              defaultType={checkboxChecked ? "Selected" : "Deselected"}
              order={["Deselected","Selected"]}
              size={24}
              onStateChange={handleCheckboxChange}
            />
            <p className="text-secondary text-xxs font-medium">{checkboxLabel}</p>
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

const Action: React.FC<ActionProps> = ({ actionType, defaultBothSelectable = false, hasWalletConnected = false }) => {
  const { bothSelected, setBothSelected, payAsset, receiveAsset, payShowDual, receiveShowDual } = useActionState(actionType, defaultBothSelectable)
  const { wallet } = useWallet()
  const { openWalletSidebar } = useWalletSidebar()

  const actionTypeText = capitalize(actionType)
  const checkboxLabel = `${capitalize(actionType)} both (DJED & SHEN)`

  const [buttonText, setButtonText] = React.useState(`Connect Wallet to ${actionTypeText}`)
  const [receiveValues, setReceiveValues] = React.useState<Record<string,string>>({})
  const [payValues, setPayValues] = React.useState<Record<string,string>>({})
  const [activeReceiveToken, setActiveReceiveToken] = React.useState(receiveAsset.coins[0])
  const [activePayToken, setActivePayToken] = React.useState(payAsset.coins[0])

  const handleInputChange = (token: string, val: string, type: Type) => {
    const numVal = parseFloat(val) || 0

    let newPayValues = { ...payValues }
    let newReceiveValues = { ...receiveValues }
    let newActivePayToken = activePayToken
    let newActiveReceiveToken = activeReceiveToken

    if (type === "pay") {
      newActivePayToken = token
      newPayValues[token] = val

      if (bothSelected) {
        newReceiveValues = {}
        receiveAsset.coins.forEach(rc => {
          newReceiveValues[rc] = convert(numVal, token, rc).toString()
        })
      } else if (activeReceiveToken) {
        newReceiveValues[activeReceiveToken] = convert(numVal, token, activeReceiveToken).toString()
      }

    } else {
      newActiveReceiveToken = token
      newReceiveValues[token] = val

      if (bothSelected) {
        newPayValues = {}
        payAsset.coins.forEach(pc => {
          newPayValues[pc] = convert(numVal, token, pc).toString()
        })
      } else if (activePayToken) {
        newPayValues[activePayToken] = convert(numVal, token, activePayToken).toString()
      }
    }

    setActivePayToken(newActivePayToken)
    setActiveReceiveToken(newActiveReceiveToken)
    setPayValues(newPayValues)
    setReceiveValues(newReceiveValues)

    console.log("Pay Map:", newPayValues)
    console.log("Receive Map:", newReceiveValues)
    console.log("Active Pay Token:", newActivePayToken)
    console.log("Active Receive Token:", newActiveReceiveToken)
    console.log("Both Selected:", bothSelected)
  }

  const handleBothSelectedChange = (selected:boolean)=>{
    setBothSelected(selected)

    let newPayValues = { ...payValues }
    let newReceiveValues = { ...receiveValues }

    if(selected){
      if(activePayToken){
        const val=parseFloat(payValues[activePayToken]||"0")||0
        newReceiveValues = {}
        receiveAsset.coins.forEach(rc=>newReceiveValues[rc]=convert(val,activePayToken,rc).toString())
      }
      if(activeReceiveToken){
        const val=parseFloat(receiveValues[activeReceiveToken]||"0")||0
        newPayValues = {}
        payAsset.coins.forEach(pc=>newPayValues[pc]=convert(val,activeReceiveToken,pc).toString())
      }
    }

    setPayValues(newPayValues)
    setReceiveValues(newReceiveValues)

    console.log("Pay Map:", newPayValues)
    console.log("Receive Map:", newReceiveValues)
    console.log("Active Pay Token:", activePayToken)
    console.log("Active Receive Token:", activeReceiveToken)
    console.log("Both Selected:", selected)
  }

  const handleButtonClick = () => {
    if (!hasWalletConnected) {
      openWalletSidebar()
      return
    }
    console.log("Pay Map:",payValues)
    console.log("Receive Map:",receiveValues)
    console.log("Active Pay Token:",activePayToken)
    console.log("Active Receive Token:",activeReceiveToken)
    console.log("Both Selected:",bothSelected)
  }

  const generateInputHandlers = (asset: AssetProps, type:"pay"|"receive") => asset.coins.map(coin=>({
    token: coin,
    value: type==="receive"?receiveValues[coin]??"": payValues[coin]??"",
    onChange: val => handleInputChange(coin,val,type)
  }))

  const handleActiveReceiveTokenChange = (token: IconCoinName) => {
    const oldToken = activeReceiveToken
    setActiveReceiveToken(token)
    
    if (bothSelected) return
    
    const activePayValue = parseFloat(payValues[activePayToken] || "0") || 0
    if (activePayValue > 0) {
      const converted = convert(activePayValue, activePayToken, token)
      setReceiveValues({ [token]: converted.toString() })

      console.log("Pay Map:",payValues)
      console.log("Receive Map:",receiveValues)
      console.log("Active Pay Token:",activePayToken)
      console.log("Active Receive Token:",activeReceiveToken)
      console.log("Both Selected:",bothSelected)
      return
    }
    
    const oldReceiveValue = parseFloat(receiveValues[oldToken] || "0") || 0
    if (oldReceiveValue > 0) {
      const newPayValue = convert(oldReceiveValue, oldToken, activePayToken)
      const newReceiveValue = convert(newPayValue, activePayToken, token)
      setPayValues({ [activePayToken]: newPayValue.toString() })
      setReceiveValues({ [token]: newReceiveValue.toString() })
    }

    console.log("Pay Map:",payValues)
    console.log("Receive Map:",receiveValues)
    console.log("Active Pay Token:",activePayToken)
    console.log("Active Receive Token:",activeReceiveToken)
    console.log("Both Selected:",bothSelected)
    
  }

  const handleActivePayTokenChange = (token: IconCoinName) => {
    const oldToken = activePayToken
    setActivePayToken(token)
    
    if (bothSelected) return
    
    const activeReceiveValue = parseFloat(receiveValues[activeReceiveToken] || "0") || 0
    if (activeReceiveValue > 0) {
      const converted = convert(activeReceiveValue, activeReceiveToken, token)
      setPayValues({ [token]: converted.toString() })
      return
    }
    
    const oldPayValue = parseFloat(payValues[oldToken] || "0") || 0
    if (oldPayValue > 0) {
      const newReceiveValue = convert(oldPayValue, oldToken, activeReceiveToken)
      const newPayValue = convert(newReceiveValue, activeReceiveToken, token)
      setReceiveValues({ [activeReceiveToken]: newReceiveValue.toString() })
      setPayValues({ [token]: newPayValue.toString() })
    }
  }

  React.useEffect(() => {
    if (!hasWalletConnected) {
      setButtonText(`Connect Wallet to ${actionTypeText}`)
      return
    }
    const payEmpty = Object.values(payValues).every(v => !v || v === "0")
    const receiveEmpty = Object.values(receiveValues).every(v => !v || v === "0")
    setButtonText(payEmpty || receiveEmpty ? `Fill in the Amount to ${actionTypeText}` : actionTypeText)
  }, [payValues, receiveValues, hasWalletConnected, actionTypeText])

  return (
    <div className="flex flex-col gap-24">
      <InputAction
        label="You Receive"
        asset={{ 
          ...receiveAsset, 
          coin: activeReceiveToken, 
          onCoinChange: handleActiveReceiveTokenChange 
        }}
        showCheckbox
        checkboxLabel={checkboxLabel}
        checkboxChecked={bothSelected}
        onCheckboxChange={handleBothSelectedChange}
        showDualInput={receiveShowDual}
        inputHandlers={generateInputHandlers(receiveAsset,"receive")}
      />
      <InputAction
        label="You Pay"
        asset={{ ...payAsset, coin: activePayToken, onCoinChange: handleActivePayTokenChange }}
        showDualInput={payShowDual}
        inputHandlers={generateInputHandlers(payAsset,"pay")}
      />
      <Button
        id={`${actionType}-submit-button`}
        variant="secondary"
        size="medium"
        text={buttonText}
        disabled={hasWalletConnected && (Object.values(payValues).every(v => !v || v === "0") || Object.values(receiveValues).every(v => !v || v === "0"))}
        onClick={handleButtonClick}
      />
    </div>
  )
}

export default Action
