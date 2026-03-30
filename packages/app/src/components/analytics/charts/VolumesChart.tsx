import React from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import type { Currency } from "../useAnalyticsData"
import { formatAxisValue } from "@/utils"
import { useTranslations } from "next-intl"
import type { VolumesResponse } from "@open-djed/api"

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
      name: t("analytics.total", { analytic: "DJED" }),
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: isUSD ? "totalShenVolumeUSD" : "totalShenVolumeADA",
      name: t("analytics.total", { analytic: "SHEN" }),
      stroke: "var(--color-supportive-5-300)",
    },
    {
      dataKey: isUSD ? "djedMintedUSD" : "djedMintedADA",
      name: t("analytics.mintedToken", { token: "DJED" }),
      stroke: "var(--color-supportive-1-300)",
    },
    {
      dataKey: isUSD ? "djedBurnedUSD" : "djedBurnedADA",
      name: t("analytics.burnedToken", { token: "DJED" }),
      stroke: "var(--color-supportive-1-700)",
    },
    {
      dataKey: isUSD ? "shenMintedUSD" : "shenMintedADA",
      name: t("analytics.mintedToken", { token: "SHEN" }),
      stroke: "var(--color-supportive-4-300)",
    },
    {
      dataKey: isUSD ? "shenBurnedUSD" : "shenBurnedADA",
      name: t("analytics.burnedToken", { token: "SHEN" }),
      stroke: "var(--color-lilac-400)",
    },
    {
      dataKey: isUSD ? "totalVolumeUSD" : "totalVolumeADA",
      name: t("analytics.total", { analytic: t("analytics.volume") }),
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
