import React from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import type { Currency } from "../useAnalyticsData"
import { formatAxisValue } from "@/lib/utils"
import type { VolumesResponse } from "@/queries/analytics/volumes/volumes.schema"

type VolumeChartProps = {
  title?: string
  data: VolumesResponse
  currency: Currency
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, currency }) => {
  const isUSD = currency.value === "USD"

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: isUSD ? "totalDjedVolumeUSD" : "totalDjedVolumeADA",
      name: "Total DJED",
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: isUSD ? "totalShenVolumeUSD" : "totalShenVolumeADA",
      name: "Total SHEN",
      stroke: "var(--color-supportive-5-300)",
    },
    {
      dataKey: isUSD ? "djedMintedUSD" : "djedMintedADA",
      name: "DJED Minted",
      stroke: "var(--color-supportive-1-300)",
    },
    {
      dataKey: isUSD ? "djedBurnedUSD" : "djedBurnedADA",
      name: "DJED Burned",
      stroke: "var(--color-supportive-1-700)",
    },
    {
      dataKey: isUSD ? "shenMintedUSD" : "shenMintedADA",
      name: "SHEN Minted",
      stroke: "var(--color-supportive-4-300)",
    },
    {
      dataKey: isUSD ? "shenBurnedUSD" : "shenBurnedADA",
      name: "SHEN Burned",
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
