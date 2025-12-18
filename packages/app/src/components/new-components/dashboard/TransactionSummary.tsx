"use client"

import * as React from "react"
import { useMintBurnAction } from "./useMintBurnAction"
import BaseCard from "../card/BaseCard"
import Divider from "../Divider"
import { useTransactionSummary } from "./useTransactionSummary"

export type TransactionSummaryProps = {
  action: ReturnType<typeof useMintBurnAction>
}

export type Valueitem = {
  topValue: string
  bottomValue: string
}

export type TransactionItem = {
  parentIndex: number
  label: string
  values?: Valueitem[]
}

const TransactionSummaryItem: React.FC<TransactionItem> = ({
  parentIndex,
  label,
  values,
}) => {
  return (
    <div className="flex flex-row gap-12">
      <p className="text-secondary flex-1 text-xs">{label}</p>

      {/* Values */}
      <div className="flex flex-row gap-12">
        {values &&
          values.map((item, index) => (
            <React.Fragment key={parentIndex + "-" + index}>
              <div className="flex flex-col items-end gap-4">
                <p className="text-xs">{item.topValue}</p>
                <p className="text-secondary text-xxs">{item.bottomValue}</p>
              </div>
              {values.length - 1 !== index && (
                <Divider orientation="vertical" />
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ action }) => {
  const items = useTransactionSummary({ action })

  const totalPay = action.payValues[action.activePayToken];

  const BlurContent = React.useMemo(() => {

    if (totalPay === 0) {
      return (
        <div className="flex h-full flex-col justify-center text-center gap-6">
          <p className="text-md font-semibold">Transaction Summary</p>
          <p className="text-sm">
            Start by entering an amount to see the full cost breakdown.
          </p>
        </div>
      )
    }

    return null
  }, [totalPay])

  return (
    <BaseCard
      className="p-24"
      overlay={totalPay === 0}
      overlayContent={BlurContent || undefined}
    >
      <div className="flex flex-col gap-24">
        <p className="text-md font-medium">Transaction Summary</p>
        <div className="flex flex-col gap-16">
          {items.map((item, index) => (
            <TransactionSummaryItem key={item.label} {...item} parentIndex={index} />
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export default TransactionSummary
