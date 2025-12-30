import * as React from "react"
import Wallet, { type WalletName } from "../Wallet"
import {
  capitalizeLower,
  formatNumber,
  shortenString,
  type Value,
} from "@/lib/utils"
import Icon from "../Icon"
import { useClipboard } from "@/hooks/useClipboard"
import ButtonIcon from "../ButtonIcon"
import Tooltip from "../tooltip/Tooltip"
import { useProtocolData } from "@/hooks/useProtocolData"
import { env } from "@/lib/envLoader"

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
  const { data } = useProtocolData()
  const { NETWORK } = env

  const adaUSD = React.useMemo(() => {
    if (!data || NETWORK === "Preprod") return 0

    const value = { ADA: balance.ADA } as Value
    return data.to(value, "DJED")
  }, [data, NETWORK, balance.ADA])

  const djedUSD = React.useMemo(() => {
    if (!data || NETWORK === "Preprod") return 0

    const value = { DJED: balance.DJED } as Value
    return data.to(value, "DJED")
  }, [data, NETWORK, balance.DJED])

  const shenUSD = React.useMemo(() => {
    if (!data || NETWORK === "Preprod") return 0

    const value = { SHEN: balance.SHEN } as Value
    return data.to(value, "DJED")
  }, [data, NETWORK, balance.SHEN])

  const totalBalance = adaUSD + djedUSD + shenUSD

  const handleCopy = () => {
    copy(address).catch((err) => {
      console.error("Failed to copy address:", err)
    })
  }

  return (
    <div className="bg-surface-secondary border-gradient border-color-gradient flex w-full flex-row items-center justify-between gap-8 rounded-full p-12">
      <div className="flex flex-row items-center justify-between gap-8">
        <Wallet name={name} size={30} />
        <div className="flex w-38.75 flex-col justify-start">
          <span className="text-sm">{capitalizeLower(name)}</span>
          <div className="flex flex-row items-center gap-6">
            <span className="text-tertiary text-sm">
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
      {NETWORK !== "Preprod" ? (
        <span className="text-md font-semibold">
          ${formatNumber(totalBalance, { maximumFractionDigits: 2 })}
        </span>
      ) : null}
      <ButtonIcon
        icon="Disconnect"
        variant="secondary"
        onClick={onDisconnect}
      />
    </div>
  )
}

export default WalletDetail
