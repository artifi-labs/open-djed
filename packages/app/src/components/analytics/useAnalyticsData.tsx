"use client"

import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { AppError } from "@open-djed/api/src/errors"
import { useCallback, useEffect, useState } from "react"

export type ReserveRatioChartEntry = { date: string; value: number }
export type DjedMChartEntry = {
  date: string
  adaValue: number
  usdValue: number
}

export const CHART_PERIOD_OPTIONS = ["D", "W", "M", "1Y", "All"] as const
export type ChartPeriod = (typeof CHART_PERIOD_OPTIONS)[number]

export function useAnalyticsData() {
  const client = useApiClient()
  const { reserveRatio } = useReserveDetails()
  const { showToast } = useToast()
  const { data, isLoading } = useProtocolData()

  const [reserveRatioData, setReserveRatioData] = useState<
    ReserveRatioChartEntry[]
  >([])
  const [reserveRatioPeriod, setReserveRatioPeriod] = useState<ChartPeriod>("W")
  const [djedMCHistoricalData, setDjedMCHistoricalData] = useState<
    DjedMChartEntry[]
  >([])
  const [djedMCPeriod, setDjedMCPeriod] = useState<ChartPeriod>("W")

  const [isLoadingReserve, setIsLoadingReserve] = useState(false)

  const fetchReserveRatioHistoricalData = useCallback(
    async (period: ChartPeriod) => {
      setIsLoadingReserve(true)
      try {
        const res = await client.api["historical-reserve-ratio"].$get({
          query: { period },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as ReserveRatioChartEntry[]

          if (reserveRatio !== undefined) {
            const todayKey = new Date().toISOString().slice(0, 10)
            historicalData.push({
              date: todayKey,
              value: reserveRatio,
            })
          }

          setReserveRatioData(historicalData)
        }
      } catch (err) {
        console.error("Action failed:", err)
        if (err instanceof AppError) {
          showToast({
            message: `${err.message}`,
            type: "error",
          })
          return
        }

        showToast({
          message: `Failed to get historical reserve ratio data.`,
          type: "error",
        })
      } finally {
        setIsLoadingReserve(false)
      }
    },
    [reserveRatio],
  )

  const fetchDjedMCHistoricalData = useCallback(
    async (period: ChartPeriod) => {
      try {
        const res = await client.api["historical-djed-market-cap"].$get({
          query: { period },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as DjedMChartEntry[]

          if (!isLoading) {
            const todayKey = new Date().toISOString()
            historicalData.push({
              date: todayKey,
              adaValue: Number(data?.protocolData.DJED.marketCap.ADA) / 1e6,
              usdValue: Number(data?.protocolData.DJED.marketCap.USD) / 1e6,
            })
          }

          setDjedMCHistoricalData(historicalData)
        }
      } catch (err) {
        console.error("Action failed:", err)
        if (err instanceof AppError) {
          showToast({
            message: `${err.message}`,
            type: "error",
          })
          return
        }

        showToast({
          message: `Failed to get historical DJED market cap data.`,
          type: "error",
        })
      }
    },
    [data],
  )

  useEffect(() => {
    fetchReserveRatioHistoricalData(reserveRatioPeriod).catch((err) => {
      console.error("fetchReserveRatio error:", err)
    })
  }, [reserveRatioPeriod])

  useEffect(() => {
    fetchDjedMCHistoricalData(djedMCPeriod).catch((err) => {
      console.error("fetchDjedMC error:", err)
    })
  }, [djedMCPeriod])

  return {
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCHistoricalData,
    djedMCPeriod,
    setDjedMCPeriod,
    isLoadingReserve,
  }
}
