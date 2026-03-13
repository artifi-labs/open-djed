import React from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import type { Currency } from "../useAnalyticsData"
import { formatAxisValue } from "@/lib/utils"
import { useTranslations } from "next-intl"
import type { VolumesResponse } from "@/queries/analytics/volumes/volumes.schema"

type VolumeChartProps = {
  title?: string
  data: VolumesResponse
  currency: Currency
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, currency }) => {
  const t = useTranslations()
  const isUSD = currency.value === "USD"

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: isUSD ? "totalDjedVolumeUSD" : "totalDjedVolumeADA",
      name: t("analytics.totalDjed"),
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: isUSD ? "totalShenVolumeUSD" : "totalShenVolumeADA",
      name: t("analytics.totalShen"),
      stroke: "var(--color-supportive-5-300)",
    },
    {
      dataKey: isUSD ? "totalVolumeUSD" : "totalVolumeADA",
      name: t("analytics.totalVolume"),
      stroke: "var(--color-supportive-2-500)",
    },
    {
      dataKey: isUSD ? "djedMintedUSD" : "djedMintedADA",
      name: t("analytics.djedMinted"),
      stroke: "var(--color-supportive-1-300)",
    },
    {
      dataKey: isUSD ? "djedBurnedUSD" : "djedBurnedADA",
      name: t("common.burnedToken", { token: "DJED" }),
      stroke: "var(--color-supportive-1-700)",
    },
    {
      dataKey: isUSD ? "shenMintedUSD" : "shenMintedADA",
      name: t("common.mintedToken", { token: "SHEN" }),
      stroke: "var(--color-supportive-4-300)",
    },
    {
      dataKey: isUSD ? "shenBurnedUSD" : "shenBurnedADA",
      name: t("common.burnedToken", { token: "SHEN" }),
      stroke: "var(--color-lilac-400)",
    },
    {
      dataKey: isUSD ? "totalVolumeUSD" : "totalVolumeADA",
      name: "Total Volume",
      stroke: "var(--color-supportive-2-500)",
    },
  ]

  return (
    <FinancialAreaChart
      data={data}
      xKey="timestamp"
      lines={lines}
      yTickFormatter={yTickFormatter}
    />
  )
}

export default VolumeChart
