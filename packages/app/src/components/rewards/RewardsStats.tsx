"use client"

import { useTranslations } from "next-intl"
import clsx from "clsx"
import BaseCard from "@/components/card/BaseCard"
import Icon from "@/components/icons/Icon"
import Tooltip from "@/components/tooltip/Tooltip"
import { Skeleton } from "@/components/Skeleton"
import { formatNumber } from "@/utils"
import { REWARD_DISTRIBUTION_THRESHOLD_ADA } from "@/lib/constants"

type Props = {
  currentEpoch: number | null
  totalDistributed: number | null
  totalPending: number | null
  loading?: boolean
}

const ada = (value: number | null) =>
  value === null ? "-" : `${formatNumber(value)} ADA`

const StatCard = ({
  label,
  value,
  tooltip,
  className,
  loading,
}: {
  label: string
  value: string
  tooltip?: string
  className?: string
  loading?: boolean
}) => (
  <BaseCard className={clsx("gap-6", className)}>
    <span className="text-tertiary flex items-center gap-6 text-sm font-medium">
      {label}
      {tooltip && (
        <Tooltip text={tooltip}>
          <Icon name="Information" size={14} className="cursor-pointer" />
        </Tooltip>
      )}
    </span>
    {loading ? (
      <Skeleton width="w-32" height="h-[24px]" />
    ) : (
      <span className="text-h3 font-bold">{value}</span>
    )}
  </BaseCard>
)

const RewardsStats = ({
  currentEpoch,
  totalDistributed,
  totalPending,
  loading = false,
}: Props) => {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={t("rewards.stats.currentEpoch")}
        value={currentEpoch === null ? "-" : String(currentEpoch)}
        loading={loading}
      />
      <StatCard
        label={t("rewards.stats.totalDistributed")}
        value={ada(totalDistributed)}
        loading={loading}
      />
      <StatCard
        label={t("rewards.stats.totalPending")}
        value={ada(totalPending)}
        tooltip={t("rewards.pendingRewardsHint", {
          threshold: REWARD_DISTRIBUTION_THRESHOLD_ADA,
        })}
        className="sm:col-span-2 lg:col-span-1"
        loading={loading}
      />
    </div>
  )
}

export default RewardsStats
