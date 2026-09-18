"use client"

import { useTranslations } from "next-intl"
import { formatDateLabel } from "@/utils/date"
import type { RewardEpoch } from "@/queries/rewards/rewards.schema"

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-2 px-16 py-12">
    <span className="text-tertiary text-xxs">{label}</span>
    <span className="text-primary text-xs">{value}</span>
  </div>
)

const RewardEpochDetails = ({ epoch }: { epoch: RewardEpoch }) => {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <Field
        label={t("rewards.table.details.epochStart")}
        value={formatDateLabel(epoch.epochStartTime) ?? "-"}
      />
      <Field
        label={t("rewards.table.details.epochEnd")}
        value={formatDateLabel(epoch.epochEndTime) ?? "-"}
      />
    </div>
  )
}

export default RewardEpochDetails
