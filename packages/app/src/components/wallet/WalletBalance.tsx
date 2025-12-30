import React from "react"
import Coin from "../Coin"
import { useProtocolData } from "@/hooks/useProtocolData"
import { formatNumber, type Value } from "@/lib/utils"
import { env } from "@/lib/envLoader"

type WalletBalanceProps = {
  token: "ADA" | "SHEN" | "DJED"
  amount: number
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ token, amount }) => {
  const { data } = useProtocolData()
  const { NETWORK } = env

  const amountUSD = React.useMemo(() => {
    if (!data || NETWORK === "Preprod") return 0

    const value = { [token]: amount } as Value
    return data.to(value, "DJED")
  }, [data, token, amount])

  const amountToken = React.useMemo(() => {
    if (!data || NETWORK === "Preprod") return 0

    const value = { [token]: 1 } as Value
    return data.to(value, "DJED")
  }, [data, token, amount])

  return (
    <div className="rounded-8 bg-surface-secondary border-border-secondary flex w-full min-w-fit flex-col items-center gap-12 border px-8 py-12">
      <div className="flex w-full flex-row items-center justify-between gap-12">
        <div className="flex flex-row items-center gap-8">
          <Coin name={token} size="medium" checked={false} />
          <span className="text-xs">{token}</span>
        </div>
        <span className="text-xs">
          {formatNumber(amount, { maximumFractionDigits: 2 })}
        </span>
      </div>
      {NETWORK !== "Preprod" && (
        <div className="flex w-full flex-row items-center justify-between">
          <span className="text-tertiary text-[10px] md:text-xs">
            ${formatNumber(amountToken, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold">
            ${formatNumber(amountUSD, { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  )
}

export default WalletBalance
