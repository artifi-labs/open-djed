"use client"

import { useToast } from "@/context/ToastContext"
import { useEffect, useMemo, useState } from "react"
import { env } from "@/lib/envLoader"
import { useReserveRatioQuery } from "@/queries/analytics/reserveRatio/reserveRatio.query"
import { useMarketCapQuery } from "@/queries/analytics/marketCap/marketCap.query"
import { useVolumeQuery } from "@/queries/analytics/volumes/volumes.query"
import { useDjedDexPricesQuery } from "@/queries/analytics/dexPrices/djedDexPrices.query"
import { useShenAdaPriceQuery } from "@/queries/analytics/shenAdaPrice/shenAdaPrice.query"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { useProtocolData } from "@/hooks/useProtocolData"
import { Rational, shenADARate, shenUSDRate } from "@open-djed/math"
import type { MarketCapResponse } from "@/queries/analytics/marketCap/marketCap.schema"
import type { MarketCapValue } from "@open-djed/api"

export type CurrencyValue = "ADA" | "USD"
export const CURRENCY_OPTIONS: Array<{ label: string; value: CurrencyValue }> =
  [
    { label: "USD", value: "USD" },
    { label: "ADA", value: "ADA" },
  ]
export type Currency = (typeof CURRENCY_OPTIONS)[number]

export type ChartPeriodValue = "W" | "M" | "Y" | "All"
export const CHART_PERIOD_OPTIONS: Array<{
  label: string
  value: ChartPeriodValue
}> = [
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

function formatMarketCapData(
  rawData: MarketCapResponse,
  protocolMarketCap?: MarketCapValue,
) {
  if (!rawData) return []

  const formatted = rawData.map((entry) => ({
    ...entry,
    usdValue: Number(entry.usdValue) / 1e6,
    adaValue: Number(entry.adaValue) / 1e6,
  }))

  if (protocolMarketCap) {
    formatted.push({
      id: -1,
      timestamp: new Date().toISOString(),
      adaValue: Number(protocolMarketCap.ADA) / 1e6,
      usdValue: Number(protocolMarketCap.USD) / 1e6,
    })
  }

  return formatted
}

export function useAnalyticsData() {
  const { showToast } = useToast()
  const { NETWORK } = env
  const { reserveRatio } = useReserveDetails()
  const { data, isLoading } = useProtocolData()

  const [reserveRatioPeriod, setReserveRatioPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[0],
  )
  const [djedMCPeriod, setDjedMCPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[0],
  )
  const [djedMCCurrency, setDjedMCCurrency] = useState<Currency>(
    CURRENCY_OPTIONS[0],
  )
  const [shenMCPeriod, setShenMCPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[0],
  )
  const [shenMCCurrency, setShenMCCurrency] = useState<Currency>(
    CURRENCY_OPTIONS[0],
  )

  const [shenAdaPricePeriod, setShenAdaPricePeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[1],
  )
  const [shenAdaCurrency, setShenAdaCurrency] = useState<Currency>(
    CURRENCY_OPTIONS[0],
  )

  const [volumesPeriod, setVolumesPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[0],
  )
  const [volumesCurrency, setVolumesCurrency] = useState<Currency>(
    CURRENCY_OPTIONS[0],
  )

  const [djedDexPeriod, setDjedDexPeriod] = useState<ChartPeriod>(
    CHART_PERIOD_OPTIONS[1],
  )
  const [djedDexCurrency, setDjedDexCurrency] = useState<Currency>(
    CURRENCY_OPTIONS[NETWORK === "Mainnet" ? 0 : 1],
  )

  // Queries
  const { data: reserveRatioData, error: reserveRatioError } =
    useReserveRatioQuery({ period: reserveRatioPeriod.value })

  const { data: djedMCData, error: djedMCError } = useMarketCapQuery({
    period: djedMCPeriod.value,
    token: "DJED",
  })

  const { data: shenMCData, error: shenMCError } = useMarketCapQuery({
    period: shenMCPeriod.value,
    token: "SHEN",
  })

  const { data: volumesData, error: volumesError } = useVolumeQuery({
    period: volumesPeriod.value,
  })

  const { data: djedDexsData, error: djedDexsError } = useDjedDexPricesQuery({
    period: djedDexPeriod.value,
  })

  const { data: shenAdaData, error: shenAdaError } = useShenAdaPriceQuery({
    period: shenAdaPricePeriod.value,
  })

  // Data formatting
  const formattedReserveRatioData = useMemo(() => {
    if (!reserveRatioData) return []

    const updated = reserveRatioData.map((entry) => ({
      ...entry,
      reserveRatio: Number(entry.reserveRatio) * 100,
    }))

    if (reserveRatio !== undefined) {
      updated.push({
        id: -1,
        timestamp: new Date().toISOString(),
        reserveRatio,
      })
    }

    return updated
  }, [reserveRatioData, reserveRatio])

  const formattedDjedMCData = useMemo(() => {
    if (!djedMCData || !data) return []

    return formatMarketCapData(djedMCData, data.protocolData.DJED.marketCap)
  }, [djedMCData, isLoading, data])

  const formattedShenMCData = useMemo(() => {
    if (!shenMCData || !data) return []

    return formatMarketCapData(shenMCData, data.protocolData.SHEN.marketCap)
  }, [shenMCData, isLoading, data])

  const formattedShenAdaData = useMemo(() => {
    if (!shenAdaData) return { ADA: [], SHEN: [] }

    const result = {
      ADA: [...shenAdaData.ADA],
      SHEN: [...shenAdaData.SHEN],
    }

    if (data && result.ADA.length && result.SHEN.length) {
      const todayKey = new Date().toISOString()

      result.ADA[result.ADA.length - 1] = {
        ...result.ADA[result.ADA.length - 1],
        timestamp: todayKey,
        token: "ADA",
        adaValue: 1,
        usdValue: new Rational(
          data.oracleDatum.oracleFields.adaUSDExchangeRate,
        ).toNumber(),
      }

      result.SHEN[result.SHEN.length - 1] = {
        ...result.SHEN[result.SHEN.length - 1],
        timestamp: todayKey,
        token: "SHEN",
        adaValue: shenADARate(data.poolDatum, data.oracleDatum).toNumber(),
        usdValue: shenUSDRate(data.poolDatum, data.oracleDatum).toNumber(),
      }
    }

    return result
  }, [shenAdaData, data])

  // Error handling
  useEffect(() => {
    if (reserveRatioError) {
      showToast({
        message: "Failed to get historical reserve ratio data.",
        type: "error",
      })
    }
  }, [reserveRatioError, showToast])

  useEffect(() => {
    if (djedMCError) {
      showToast({
        message: "Failed to get historical market cap data.",
        type: "error",
      })
    }
  }, [djedMCError, showToast])

  useEffect(() => {
    if (shenMCError) {
      showToast({
        message: "Failed to get historical market cap data.",
        type: "error",
      })
    }
  }, [shenMCError, showToast])

  useEffect(() => {
    if (volumesError) {
      showToast({
        message: "Failed to get historical volume data.",
        type: "error",
      })
    }
  }, [volumesError, showToast])

  useEffect(() => {
    if (djedDexsError) {
      showToast({
        message: "Failed to get historical Djed Dex Prices data.",
        type: "error",
      })
    }
  }, [djedDexsError, showToast])

  useEffect(() => {
    if (shenAdaError) {
      showToast({
        message: "Failed to get historical Shen Ada Price data.",
        type: "error",
      })
    }
  }, [shenAdaError, showToast])

  return {
    reserveRatioData: formattedReserveRatioData || [],
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCHistoricalData: formattedDjedMCData || [],
    djedMCPeriod,
    setDjedMCPeriod,
    djedMCCurrency,
    setDjedMCCurrency,
    shenMCHistoricalData: formattedShenMCData || [],
    shenMCPeriod,
    setShenMCPeriod,
    shenMCCurrency,
    setShenMCCurrency,
    shenAdaHistoricalData: formattedShenAdaData ?? { ADA: [], SHEN: [] },
    shenAdaPricePeriod,
    setShenAdaPricePeriod,
    shenAdaCurrency,
    setShenAdaCurrency,
    volumesHistoricalData: volumesData || [],
    volumesPeriod,
    setVolumesPeriod,
    volumesCurrency,
    setVolumesCurrency,
    djedDexCurrency,
    djedDexHistoricalData: djedDexsData || [],
    djedDexPeriod,
    setDjedDexCurrency,
    setDjedDexPeriod,
  }
}
