import React from "react"
import { transactionSummaryBuilder } from "./transactionSummaryBuilder"
import { formatToken, formatUSD } from "@/lib/utils"
import { useMintBurnAction } from "./useMintBurnAction"

export function useTransactionSummary(
  action: ReturnType<typeof useMintBurnAction>,
) {
  const {
    payValues,
    config,
    bothSelected,
    activePayToken,
    activeReceiveToken,
  } = action

  return React.useMemo(() => {
    const b = transactionSummaryBuilder()

    const payTokens = config.pay
    const receiveTokens = config.receive

    const visiblePayTokens = bothSelected ? payTokens : [activePayToken]
    const visibleReceiveTokens = bothSelected
      ? receiveTokens
      : [activeReceiveToken]

    const primaryPayToken = visiblePayTokens[0]

    const totalPay = visiblePayTokens.reduce(
      (acc, t) => acc + (payValues[t] || 0),
      0,
    )

    b.addSingle(
      "Base Cost",
      formatToken(totalPay, primaryPayToken),
      formatUSD(totalPay * 0.52),
    )
      .addSingle(
        "Mint Fee",
        formatToken(totalPay * 0.05, primaryPayToken),
        formatUSD(totalPay * 0.03),
      )
      .addMulti(
        "Operator Fee",
        visiblePayTokens.map((t) => [
          formatToken(payValues[t] || 0, t),
          formatUSD((payValues[t] || 0) * 0.52),
        ]),
      )
      .addMulti(
        "Total Cost",
        visiblePayTokens.map((t) => [
          formatToken(payValues[t] || 0, t),
          formatUSD((payValues[t] || 0) * 0.52),
        ]),
      )
      .addMulti(
        "Refundable Deposit",
        visiblePayTokens.map((t) => [
          formatToken(payValues[t] || 0, t),
          formatUSD((payValues[t] || 0) * 0.52),
        ]),
      )
      .addMulti(
        "Price",
        visibleReceiveTokens.map((t) => [
          formatToken(payValues[t] || 0, t),
          formatUSD((payValues[t] || 0) * 0.52),
        ]),
      )

    return b.build()
  }, [
    config.pay,
    config.receive,
    bothSelected,
    activePayToken,
    activeReceiveToken,
    payValues,
  ])
}
