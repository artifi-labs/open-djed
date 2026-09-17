"use client"

import * as React from "react"
import clsx from "clsx"
import { useTranslations } from "next-intl"
import Tag from "@/components/Tag"
import ButtonIcon from "@/components/ButtonIcon"
import { formatNumber } from "@/utils"
import { formatDateLabel } from "@/utils/date"
import {
  isKnownDistributionStatus,
  type RewardEpoch,
} from "@/queries/rewards/rewards.schema"
import { getStatusTagType } from "./rewardStatus"
import { formatReward } from "./rewardFormat"
import RewardTxLinks from "./RewardTxLinks"
import RewardEpochDetails from "./RewardEpochDetails"
import { isSelectingText } from "@/components/rowToggle"

const Line = ({
  label,
  children,
  valueClassName,
}: {
  label: string
  children: React.ReactNode
  valueClassName?: string
}) => (
  <div className="flex w-full flex-row items-center justify-between">
    <span className="text-tertiary text-xxs">{label}</span>
    <span className={clsx("text-xs", valueClassName)}>{children}</span>
  </div>
)

const RewardMobileCard = ({ epoch }: { epoch: RewardEpoch }) => {
  const t = useTranslations()
  const [isOpen, setIsOpen] = React.useState(false)

  const toggle = () => setIsOpen((v) => !v)

  const handleCardClick = () => {
    if (isSelectingText()) return
    toggle()
  }

  const statusLabel = isKnownDistributionStatus(epoch.distributionStatus)
    ? t(`rewards.status.${epoch.distributionStatus}`)
    : epoch.distributionStatus

  return (
    <div className="flex w-full flex-col gap-16 p-8" onClick={handleCardClick}>
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm font-semibold">
          {t("rewards.table.header.epoch")} {epoch.epochNumber}
        </span>
        <div className="flex items-center gap-8">
          <RewardTxLinks epoch={epoch} />
          <ButtonIcon
            size="tiny"
            variant="onlyIcon"
            icon="Chevron-down"
            className={clsx("transition-transform duration-200", {
              "rotate-180": isOpen,
            })}
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-8">
        <Line
          label={t("rewards.table.header.amount")}
          valueClassName="tabular-nums"
        >
          {formatNumber(epoch.shenAmount)} SHEN
        </Line>
        <Line
          label={t("rewards.table.header.reward")}
          valueClassName="tabular-nums"
        >
          {formatReward(epoch.rewardAmount, epoch.distributionStatus)}
        </Line>
        <Line label={t("rewards.table.header.date")}>
          {formatDateLabel(epoch.epochEndTime) ?? "-"}
        </Line>
        <Line label={t("rewards.table.header.status")}>
          <Tag
            type={getStatusTagType(epoch.distributionStatus)}
            role="Secondary"
            size="small"
            text={statusLabel}
          />
        </Line>
      </div>

      {isOpen && (
        <div
          className="border-border-tertiary rounded-8 border"
          onClick={(e) => e.stopPropagation()}
        >
          <RewardEpochDetails epoch={epoch} />
        </div>
      )}
    </div>
  )
}

export default RewardMobileCard
