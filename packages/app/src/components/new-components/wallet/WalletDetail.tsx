import * as React from "react"
import Wallet, { WalletName } from "../Wallet"
import {
  capitalizeLower,
  shortenString,
  type Value,
  valueToDJED,
} from "@/lib/utils"
import Icon from "../Icon"
import { useClipboard } from "@/hooks/useClipboard"
import ButtonIcon from "../ButtonIcon"
import { useProtocolData } from "@/hooks/useProtocolData"
import { useApiClient } from "@/context/ApiClientContext"

type WalletDetailProps = {
  name: WalletName
  address: string
  onDisconnect?: () => void
  balance: {
    ADA: number
    DJED: number
    SHEN: number
    handle?: string
  }
}

const WalletDetail: React.FC<WalletDetailProps> = ({
  name,
  address,
  onDisconnect,
  balance,
}) => {
  const { copy, copied } = useClipboard()

  // const api = useApiClient()
  // const { isPending, error, data } = useProtocolData()
  // const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined
  // const currentAdaValue = toUSD ? toUSD({ ADA: 1 }) : 0

  // const adaValue = toUSD ? toUSD({ ADA: balance.ADA }) : 0
  // console.log("Value: ", adaValue)

  const totalBalance = "12,485.34" // TODO dynamically define wallet total balance

  const handleCopy = () => {
    copy(address)
    // TODO add tooltip indicating if the address was copied or not
  }

  return (
    <div className="bg-surface-secondary border-gradient border-color-gradient flex w-full flex-row items-center justify-between gap-8 rounded-full p-12">
      <div className="text-primary flex flex-row items-center justify-between gap-8">
        <Wallet name={name} size={30} />
        <div className="flex w-38.75 flex-col justify-start">
          <span className="text-sm font-normal">{capitalizeLower(name)}</span>
          <div className="flex flex-row items-center gap-6">
            <span className="text-tertiary text-sm font-normal">
              {shortenString(address)}
            </span>
            <Icon
              name="Copy"
              color="text-tertiary"
              onClick={handleCopy}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      <span className="text-md font-semibold">${totalBalance}</span>
      <ButtonIcon
        icon="Disconnect"
        variant="secondary"
        onClick={onDisconnect}
      />
    </div>
  )
}

export default WalletDetail
