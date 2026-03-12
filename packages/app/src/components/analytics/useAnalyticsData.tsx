"use client"

import { useToast } from "@/context/ToastContext"
import { useEffect, useState } from "react"
import { env } from "@/lib/envLoader"
import { useReserveRatioQuery } from "@/queries/analytics/reserveRatio/reserveRatio.query"
import { useMarketCapQuery } from "@/queries/analytics/marketCap/marketCap.query"
import { useVolumeQuery } from "@/queries/analytics/volumes/volumes.query"
import { useDjedDexPricesQuery } from "@/queries/analytics/dexPrices/djedDexPrices.query"
import { useShenAdaPriceQuery } from "@/queries/analytics/shenAdaPrice/shenAdaPrice.query"

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

export function useAnalyticsData() {
  const { showToast } = useToast()
  const { NETWORK } = env

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
    reserveRatioData: reserveRatioData || [],
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCHistoricalData: djedMCData || [],
    djedMCPeriod,
    setDjedMCPeriod,
    djedMCCurrency,
    setDjedMCCurrency,
    shenMCHistoricalData: shenMCData || [],
    shenMCPeriod,
    setShenMCPeriod,
    shenMCCurrency,
    setShenMCCurrency,
    shenAdaHistoricalData: shenAdaData ?? { ADA: [], SHEN: [] },
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
