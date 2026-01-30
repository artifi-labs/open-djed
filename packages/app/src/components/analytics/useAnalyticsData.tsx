"use client"

import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { AppError } from "@open-djed/api/src/errors"
import { useCallback, useEffect, useState } from "react"

export type ReserveRatioChartEntry = { name: string; value: number }
export const RESERVE_RATIO_OPTIONS = ["D", "W", "M", "1Y"] as const
export type ReserveRatioChartPeriod = (typeof RESERVE_RATIO_OPTIONS)[number]

export function useAnalyticsData() {
  const client = useApiClient()
  const { reserveRatio } = useReserveDetails()
  const { showToast } = useToast()

  const [reserveRatioData, setReserveRatioData] = useState<
    ReserveRatioChartEntry[]
  >([])
  const [reserveRatioPeriod, setReserveRatioPeriod] =
    useState<ReserveRatioChartPeriod>("W")

  const [isLoadingReserve, setIsLoadingReserve] = useState(false)

  const fetchReserveRatioHistoricalData = useCallback(
    async (period: ReserveRatioChartPeriod) => {
      setIsLoadingReserve(true)
      try {
        const res = await client.api["historical-reserve-ratio"][
          ":period"
        ].$get({
          param: { period },
        })

        if (res.ok) {
          const historicalData = await res.json()

          if (reserveRatio !== undefined) {
            const todayKey = new Date().toISOString().slice(0, 10)
            historicalData.push({
              name: todayKey,
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
          message: `Transaction failed. Please try again.`,
          type: "error",
        })
      } finally {
        setIsLoadingReserve(false)
      }
    },
    [reserveRatio],
  )

  useEffect(() => {
    fetchReserveRatioHistoricalData(reserveRatioPeriod).catch((err) => {
      console.error("fetchReserveRatio error:", err)
    })
  }, [reserveRatioPeriod, fetchReserveRatioHistoricalData])

  return {
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    isLoadingReserve,
  }
}
