import * as React from "react"
import Wallet, { type WalletName } from "../Wallet"
import { capitalizeLower, shortenString } from "@/lib/utils"
import Icon from "../Icon"
import { useClipboard } from "@/hooks/useClipboard"
import ButtonIcon from "../ButtonIcon"
import Tooltip from "../Tooltip"

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

  console.log("Value: ", balance)
  const totalBalance = "12,485.34" // TODO dynamically define wallet total balance

  const handleCopy = () => {
    copy(address)
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
            <Tooltip
              tooltipDirection="bottom"
              text={copied ? "Copied address!" : "Copy address"}
            >
              <Icon
                name="Copy"
                color="text-tertiary"
                onClick={handleCopy}
                className="cursor-pointer"
              />
            </Tooltip>
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
