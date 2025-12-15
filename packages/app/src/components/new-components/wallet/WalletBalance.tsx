import React from "react"
import Coin from "../Coin"
import { useProtocolData } from "@/hooks/useProtocolData"
import { formatNumber, type Value } from "@/lib/utils"
import { useEnv } from "@/context/EnvContext"
import Tooltip from "../Tooltip"

type WalletBalanceProps = {
  token: "ADA" | "SHEN" | "DJED"
  amount: number
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ token, amount }) => {
  const { data } = useProtocolData()
  const { network } = useEnv()

  const amountUSD = React.useMemo(() => {
    if (!data || network === "Preprod") return 0

    const value = { [token]: amount } as Value
    return data.to(value, "DJED")
  }, [data, token, amount])

  return (
    <div className="rounded-8 bg-surface-secondary border-border-secondary flex w-full flex-col items-center gap-12 border px-8 py-12">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-8">
          <Coin name={token} size="medium" checked={false} />
          <span className="text-primary text-xs leading-4 font-normal">
            {token}
          </span>
        </div>
        <span className="text-primary text-xs leading-4 font-normal">
          12.00
        </span>
      </div>
      <div className="flex w-full flex-row items-center justify-between">
        {network === "Preprod" ? (
          <Tooltip
            text={"In Preprod, tokens have no value."}
            tooltipDirection="right"
          >
            <span className="text-primary text-xs leading-4 font-normal">
              --
            </span>
          </Tooltip>
        ) : (
          <span className="text-primary text-xs leading-4 font-normal">
            ${formatNumber(amountUSD, { maximumFractionDigits: 2 })}
          </span>
        )}
        <span className="text-primary text-xs leading-4 font-semibold">
          {formatNumber(amount, { maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}

export default WalletBalance
