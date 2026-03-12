"use client"

import React, { useMemo } from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useViewport } from "@/hooks/useViewport"
import type { Currency, VolumeChartEntry } from "../useAnalyticsData"
import { formatAxisValue } from "@/lib/utils"
import { useTranslations } from "next-intl"

type VolumeChartProps = {
  title?: string
  data: VolumeChartEntry[]
  currency: Currency
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, currency }) => {
  const t = useTranslations()
  const { isMobile } = useViewport()
  const isUSD = currency.value === "USD"

  const { rows } = useMemo(() => {
    if (!data?.length) return { rows: [] }

    return {
      rows: data.map((entry) => ({
        date: entry.timestamp,

        djedMinted: isUSD ? entry.djedMintedUSD : entry.djedMintedADA,
        djedBurned: isUSD ? entry.djedBurnedUSD : entry.djedBurnedADA,

        shenMinted: isUSD ? entry.shenMintedUSD : entry.shenMintedADA,
        shenBurned: isUSD ? entry.shenBurnedUSD : entry.shenBurnedADA,

        totalDjed: isUSD ? entry.totalDjedVolumeUSD : entry.totalDjedVolumeADA,
        totalShen: isUSD ? entry.totalShenVolumeUSD : entry.totalShenVolumeADA,

        total: isUSD ? entry.totalVolumeUSD : entry.totalVolumeADA,
      })),
    }
  }, [data, isUSD, isMobile])

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: "totalDjed",
      name: t("analytics.totalDjed"),
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: "totalShen",
      name: t("analytics.totalShen"),
      stroke: "var(--color-supportive-5-300)",
    },
    {
      dataKey: "total",
      name: t("analytics.totalVolume"),
      stroke: "var(--color-supportive-2-500)",
    },
    {
      dataKey: "djedMinted",
      name: t("common.mintedToken", { token: "DJED" }),
      stroke: "var(--color-supportive-1-300)",
    },
    {
      dataKey: "djedBurned",
      name: t("common.burnedToken", { token: "DJED" }),
      stroke: "var(--color-supportive-1-700)",
    },
    {
      dataKey: "shenMinted",
      name: t("common.mintedToken", { token: "SHEN" }),
      stroke: "var(--color-supportive-4-300)",
    },
    {
      dataKey: "shenBurned",
      name: t("common.burnedToken", { token: "SHEN" }),
      stroke: "var(--color-lilac-400)",
    },
  ]

  return (
    <FinancialAreaChart
      data={rows}
      xKey="date"
      lines={lines}
      yTickFormatter={yTickFormatter}
    />
  )
}

export default VolumeChart
