"use client"

import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { AppError } from "@open-djed/api/src/errors"
import type { Tokens } from "@open-djed/db"
import { useCallback, useEffect, useState } from "react"

export type ReserveRatioChartEntry = {
  id: number
  timestamp: string
  reserveRatio: number
}
export type DjedMChartEntry = {
  id: number
  timestamp: string
  usdValue: string
  adaValue: string
}
export type ShenMChartEntry = {
  id: number
  timestamp: string
  usdValue: string
  adaValue: string
}

export type TokenPriceChartEntry = {
  id: number
  timestamp: string
  adaValue: number
  usdValue: number
  token: Exclude<Tokens, "DJED">
}
export type TokenPriceByToken = Record<
  Exclude<Tokens, "DJED">,
  TokenPriceChartEntry[]
>

export const CURRENCY_OPTIONS = ["ADA", "USD"] as const
export type Currency = (typeof CURRENCY_OPTIONS)[number]

export const CHART_PERIOD_OPTIONS = ["D", "W", "M", "Y", "All"] as const
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
  const [shenMCHistoricalData, setShenMCHistoricalData] = useState<
    ShenMChartEntry[]
  >([])
  const [shenMCPeriod, setShenMCPeriod] = useState<ChartPeriod>("W")

  const [shenAdaHistoricalData, setShenAdaHistoricalData] =
    useState<TokenPriceByToken>({
      ADA: [],
      SHEN: [],
    })
  const [shenAdaPricePeriod, setShenAdaPricePeriod] = useState<ChartPeriod>("W")
  const [shenAdaCurrency, setShenAdaCurrency] = useState<Currency>("USD")

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
          const updatedHistoricalData = historicalData.map((entry) => ({
            ...entry,
            reserveRatio: Number(entry.reserveRatio) * 100,
          }))

          if (reserveRatio !== undefined) {
            const todayKey = new Date().toISOString()
            updatedHistoricalData.push({
              id: -1,
              timestamp: todayKey,
              reserveRatio: reserveRatio,
            })
          }

          setReserveRatioData(updatedHistoricalData)
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
        const res = await client.api["historical-market-cap"].$get({
          query: { period, token: "DJED" },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as DjedMChartEntry[]
          historicalData.map((entry) => ({
            ...entry,
            usdValue: Number(entry.usdValue),
            adaValue: Number(entry.adaValue),
          }))

          if (!isLoading) {
            const todayKey = new Date().toISOString()
            historicalData.push({
              id: -1,
              timestamp: todayKey,
              adaValue: (
                Number(data?.protocolData.DJED.marketCap.ADA) / 1e6
              ).toString(),
              usdValue: (
                Number(data?.protocolData.DJED.marketCap.USD) / 1e6
              ).toString(),
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

  const fetchShenMCHistoricalData = useCallback(
    async (period: ChartPeriod) => {
      try {
        const res = await client.api["historical-market-cap"].$get({
          query: { period, token: "SHEN" },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as ShenMChartEntry[]
          historicalData.map((entry) => ({
            ...entry,
            usdValue: Number(entry.usdValue),
            adaValue: Number(entry.adaValue),
          }))

          if (!isLoading) {
            const todayKey = new Date().toISOString()
            historicalData.push({
              id: -1,
              timestamp: todayKey,
              adaValue: (
                Number(data?.protocolData.SHEN.marketCap.ADA) / 1e6
              ).toString(),
              usdValue: (
                Number(data?.protocolData.SHEN.marketCap.USD) / 1e6
              ).toString(),
            })
          }

          setShenMCHistoricalData(historicalData)
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
          message: `Failed to get historical SHEN market cap data.`,
          type: "error",
        })
      }
    },
    [data],
  )

  const fetchShenAdaPriceHistoricalData = useCallback(
    async (period: ChartPeriod) => {
      try {
        const res = await client.api["historical-shen-ada-price"].$get({
          query: { period },
        })

        if (!res.ok) return

        const historicalData = (await res.json()) as TokenPriceByToken
        historicalData.ADA = historicalData.ADA.map((entry) => ({
          ...entry,
          adaValue: Number(entry.adaValue),
          usdValue: Number(entry.usdValue),
        }))
        historicalData.SHEN = historicalData.SHEN.map((entry) => ({
          ...entry,
          adaValue: Number(entry.adaValue),
          usdValue: Number(entry.usdValue),
        }))
        setShenAdaHistoricalData(historicalData)
      } catch (err) {
        console.error("Action failed:", err)

        if (err instanceof AppError) {
          showToast({
            message: err.message,
            type: "error",
          })
          return
        }

        showToast({
          message: `Failed to get historical token price data.`,
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
  }, [reserveRatioPeriod, data])

  useEffect(() => {
    fetchDjedMCHistoricalData(djedMCPeriod).catch((err) => {
      console.error("fetchDjedMC error:", err)
    })
  }, [djedMCPeriod, data])

  useEffect(() => {
    fetchShenMCHistoricalData(shenMCPeriod).catch((err) => {
      console.error("fetchShenMC error:", err)
    })
  }, [shenMCPeriod, data])

  useEffect(() => {
    fetchShenAdaPriceHistoricalData(shenAdaPricePeriod).catch((err) => {
      console.error("fetchShenAdaPrice error:", err)
    })
  }, [shenAdaPricePeriod, shenAdaCurrency, data])

  return {
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCHistoricalData,
    djedMCPeriod,
    setDjedMCPeriod,
    shenMCHistoricalData,
    shenMCPeriod,
    setShenMCPeriod,
    shenAdaHistoricalData,
    shenAdaPricePeriod,
    setShenAdaPricePeriod,
    shenAdaCurrency,
    setShenAdaCurrency,
    isLoadingReserve,
  }
}
