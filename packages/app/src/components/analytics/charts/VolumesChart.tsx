"use client"

import React, { useMemo } from "react"
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { useViewport } from "@/hooks/useViewport"
import type { Currency, VolumeChartEntry } from "../useAnalyticsData"

type VolumeChartProps = {
  title?: string
  data: VolumeChartEntry[]
  currency: Currency
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, currency }) => {
  console.log("volumes: ", data)
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

  const formatAxisValue = (val: number) => {
    const abs = Math.abs(val)
    if (abs < 1) return val.toFixed(3)
    if (abs < 1_000) return Math.round(val).toString()
    if (abs < 1_000_000) return `${(val / 1_000).toFixed(1)}k`
    if (abs < 1_000_000_000) return `${(val / 1_000_000).toFixed(1)}M`
    return `${(val / 1_000_000_000).toFixed(1)}B`
  }

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: "totalDjed",
      name: "Total DJED",
      stroke: "var(--color-supportive-1-500)",
    },
    {
      dataKey: "totalShen",
      name: "Total SHEN",
      stroke: "var(--color-supportive-5-300)",
    },
    {
      dataKey: "total",
      name: "Total Volume",
      stroke: "var(--color-supportive-2-500)",
    },
    {
      dataKey: "djedMinted",
      name: "DJED Minted",
      stroke: "var(--color-supportive-1-300)",
    },
    {
      dataKey: "djedBurned",
      name: "DJED Burned",
      stroke: "var(--color-supportive-1-700)",
    },
    {
      dataKey: "shenMinted",
      name: "SHEN Minted",
      stroke: "var(--color-supportive-4-300)",
    },
    {
      dataKey: "shenBurned",
      name: "SHEN Burned",
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
