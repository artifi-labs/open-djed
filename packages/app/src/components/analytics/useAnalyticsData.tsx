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

export type ChartPeriodValue = "D" | "W" | "M" | "Y" | "All"
export const CHART_PERIOD_OPTIONS: Array<{
  label: string
  value: ChartPeriodValue
}> = [
  {
    label: "Today",
    value: "D",
  },
  {
    label: "This Week",
    value: "W",
  },
  {
    label: "This Month",
    value: "M",
  },
  {
    label: "This Year",
    value: "Y",
  },
  {
    label: "All Time",
    value: "All",
  },
]
export type ChartPeriod = (typeof CHART_PERIOD_OPTIONS)[number]

export function useAnalyticsData() {
  const client = useApiClient()
  const { reserveRatio } = useReserveDetails()
  const { showToast } = useToast()
  const { data, isLoading } = useProtocolData()

  const [reserveRatioData, setReserveRatioData] = useState<
    ReserveRatioChartEntry[]
  >([])
  const [reserveRatioPeriod, setReserveRatioPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[1],
  )

  const [djedMCHistoricalData, setDjedMCHistoricalData] = useState<
    DjedMChartEntry[]
  >([])
  const [djedMCPeriod, setDjedMCPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[1],
  )
  const [djedMCCurrency, setDjedMCCurrency] = useState<Currency>("USD")

  const [shenMCHistoricalData, setShenMCHistoricalData] = useState<
    ShenMChartEntry[]
  >([])
  const [shenMCPeriod, setShenMCPeriod] = useState<ChartPeriod>("W")
  const [shenMCCurrency, setShenMCCurrency] = useState<Currency>("USD")

  const [shenAdaHistoricalData, setShenAdaHistoricalData] =
    useState<TokenPriceByToken>({
      ADA: [],
      SHEN: [],
    })
  const [shenAdaPricePeriod, setShenAdaPricePeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[1],
  )
  const [shenAdaCurrency, setShenAdaCurrency] = useState<Currency>("USD")

  const [isLoadingReserve, setIsLoadingReserve] = useState(false)

  const fetchReserveRatioHistoricalData = useCallback(
    async (period: ChartPeriod) => {
      setIsLoadingReserve(true)
      try {
        const res = await client.api["historical-reserve-ratio"].$get({
          query: { period: period.value },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as ReserveRatioChartEntry[]
          if (period.value === "All") historicalData.shift()

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
        const res = await client.api["historical-djed-market-cap"].$get({
          query: { period: period.value },
        })

        if (res.ok) {
          const historicalData = (await res.json()) as DjedMChartEntry[]
          if (period.value === "All") historicalData.shift()

          const dataToSave = historicalData.map((entry) => ({
            ...entry,
            usdValue: (Number(entry.usdValue) / 1e6).toString(),
            adaValue: (Number(entry.adaValue) / 1e6).toString(),
          }))

          if (!isLoading) {
            const todayKey = new Date().toISOString()
            dataToSave.push({
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

          setDjedMCHistoricalData(dataToSave)
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
          const dataToSave = historicalData.map((entry) => ({
            ...entry,
            usdValue: (Number(entry.usdValue) / 1e6).toString(),
            adaValue: (Number(entry.adaValue) / 1e6).toString(),
          }))

          if (!isLoading) {
            const todayKey = new Date().toISOString()
            dataToSave.push({
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

          console.log("Fetched SHEN MC historical data:", dataToSave)
          setShenMCHistoricalData(dataToSave)
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
          query: { period: period.value },
        })

        if (!res.ok) return

        const historicalData = (await res.json()) as TokenPriceByToken
        if (period.value === "All") {
          historicalData.ADA.shift()
          historicalData.SHEN.shift()
        }

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
    djedMCCurrency,
    setDjedMCCurrency,
    shenMCHistoricalData,
    shenMCPeriod,
    setShenMCPeriod,
    shenMCCurrency,
    setShenMCCurrency,
    shenAdaHistoricalData,
    shenAdaPricePeriod,
    setShenAdaPricePeriod,
    shenAdaCurrency,
    setShenAdaCurrency,
    isLoadingReserve,
  }
}
