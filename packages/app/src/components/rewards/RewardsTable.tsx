"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import Table, { type HeaderItem } from "@/components/table/Table"
import Tag from "@/components/Tag"
import BaseCard from "@/components/card/BaseCard"
import { Skeleton } from "@/components/Skeleton"
import { useViewport } from "@/hooks/useViewport"
import { formatNumber } from "@/utils"
import { formatDateLabel } from "@/utils/date"
import {
  isKnownDistributionStatus,
  type RewardEpoch,
} from "@/queries/rewards/rewards.schema"
import RewardRow, { type RewardRowData } from "./RewardRow"
import RewardMobileCard from "./RewardMobileCard"
import RewardTxLinks from "./RewardTxLinks"
import RewardEpochDetails from "./RewardEpochDetails"
import { getStatusTagType } from "./rewardStatus"
import { formatReward } from "./rewardFormat"

type Props = {
  epochs: RewardEpoch[]
  loading: boolean
  totalCount: number
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  rowsPerPage: number
}

const HEADERS = [
  { key: "epoch", align: undefined },
  { key: "amount", align: "right" },
  { key: "reward", align: "right" },
  { key: "status", align: undefined },
  { key: "date", align: undefined },
] as const
const COLUMN_COUNT = HEADERS.length + 1 // + the actions column

const RewardsTable = ({
  epochs,
  loading,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  rowsPerPage,
}: Props) => {
  const t = useTranslations()
  const { isMobile } = useViewport()

  const headers: HeaderItem[] = useMemo(() => {
    if (isMobile) {
      return [
        {
          column: t("rewards.table.header.epoch"),
          columnKey: "rewards",
          size: "auto" as const,
        },
      ]
    }
    return [
      ...HEADERS.map(({ key, align }) => ({
        column: t(`rewards.table.header.${key}`),
        columnKey: key,
        size: "full" as const,
        align,
      })),
      { column: undefined, columnKey: "actions", size: "small" as const },
    ]
  }, [t, isMobile])

  const dataRows: RewardRowData[] = useMemo(() => {
    if (isMobile) {
      return epochs.map((e) => ({
        key: String(e.epochNumber),
        columns: [{ content: <RewardMobileCard epoch={e} /> }],
      }))
    }
    return epochs.map((e) => {
      const statusLabel = isKnownDistributionStatus(e.distributionStatus)
        ? t(`rewards.status.${e.distributionStatus}`)
        : e.distributionStatus

      return {
        key: String(e.epochNumber),
        details: <RewardEpochDetails epoch={e} />,
        columns: [
          {
            content: (
              <div className="px-16 py-12 tabular-nums">{e.epochNumber}</div>
            ),
          },
          {
            content: (
              <div className="px-16 py-12 text-right text-nowrap tabular-nums">
                {formatNumber(e.shenAmount)} SHEN
              </div>
            ),
          },
          {
            content: (
              <div className="px-16 py-12 text-right text-nowrap tabular-nums">
                {formatReward(e.rewardAmount, e.distributionStatus)}
              </div>
            ),
          },
          {
            content: (
              <div className="px-16 py-12">
                <Tag
                  type={getStatusTagType(e.distributionStatus)}
                  role="Secondary"
                  size="small"
                  text={statusLabel}
                />
              </div>
            ),
          },
          {
            content: (
              <div className="px-16 py-12 text-nowrap">
                {formatDateLabel(e.epochEndTime) ?? "-"}
              </div>
            ),
          },
          { content: <RewardTxLinks epoch={e} /> },
        ],
      }
    })
  }, [epochs, t, isMobile])

  const skeletonRowCount =
    totalCount > 0
      ? Math.min(rowsPerPage, totalCount - (currentPage - 1) * rowsPerPage)
      : rowsPerPage

  const skeletonRows: RewardRowData[] = useMemo(
    () =>
      Array.from({ length: Math.max(skeletonRowCount, 1) }).map((_, r) => ({
        key: `skeleton-${r}`,
        isPlaceholder: true,
        columns: isMobile
          ? [
              {
                content: (
                  <div className="flex flex-col gap-8 p-8">
                    <Skeleton width="w-24" height="h-[18px]" />
                    <Skeleton width="w-full" height="h-[14px]" />
                    <Skeleton width="w-full" height="h-[14px]" />
                    <Skeleton width="w-full" height="h-[14px]" />
                    <Skeleton width="w-full" height="h-[14px]" />
                  </div>
                ),
              },
            ]
          : Array.from({ length: COLUMN_COUNT }).map(() => ({
              content: (
                <div className="px-16 py-12">
                  <Skeleton width="w-full" height="h-[26px]" />
                </div>
              ),
            })),
      })),
    [skeletonRowCount, isMobile],
  )

  if (!loading && epochs.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-12">
        <h2 className="text-lg font-semibold">{t("rewards.table.title")}</h2>
        <BaseCard
          border="border-gradient border-color-primary"
          className="justify-center p-16"
        >
          <div className="flex flex-col items-center justify-center gap-24 text-center">
            <p className="text-lg font-semibold">{t("rewards.noData")}</p>
          </div>
        </BaseCard>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-12">
      <h2 className="text-lg font-semibold">{t("rewards.table.title")}</h2>

      <Table
        headers={headers}
        rows={loading ? skeletonRows : dataRows}
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
        serverSidePagination
        fixedLayout={!isMobile}
        RowComponent={RewardRow}
      />
    </div>
  )
}

export default RewardsTable
