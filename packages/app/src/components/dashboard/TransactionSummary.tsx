"use client"

import * as React from "react"
import { type useMintBurnAction } from "../../hooks/dashboard/useMintBurnAction"
import BaseCard from "../card/BaseCard"
import Divider from "../Divider"
import { useTransactionSummary } from "../../hooks/dashboard/useTransactionSummary"
import { isEmptyValue } from "@/utils"
import { useTranslations } from "next-intl"

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
  const t = useTranslations()
  const items = useTransactionSummary({ action })
  const totalPay = action.tokensStates.pay.inputs.reduce((acc, input) => acc + (input.value || 0), 0)
  const isContentBlured = isEmptyValue(totalPay)

  const BlurContent = React.useMemo(() => {
    if (isContentBlured) {
      return (
        <div className="desktop:p-24 flex h-full flex-col justify-center gap-6 p-16 text-center">
          <p className="text-md font-semibold">
            {t("dashboard.transactionSummary.title")}
          </p>
          <p className="text-sm">
            {t("dashboard.transactionSummary.description")}
          </p>
        </div>
      )
    }

    return null
  }, [totalPay])

  return (
    <BaseCard
      className="desktop:p-24 p-16"
      overlay={isContentBlured}
      overlayContent={BlurContent || undefined}
    >
      <div className="desktop:gap-24 flex flex-col gap-16">
        <p className="text-md font-medium">
          {t("dashboard.transactionSummary.title")}
        </p>
        <div className="desktop:gap-16 flex flex-col gap-14">
          {items.map((item, index) => (
            <TransactionSummaryItem key={index} {...item} parentIndex={index} />
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export default TransactionSummary
