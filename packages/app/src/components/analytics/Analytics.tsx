"use client"

import { useReserveDetails } from "@/hooks/protocol/useReserveDetails"
import ChartCard from "../card/ChartCard"
import { DjedMarketCapChart } from "./charts/DjedMarketCapChart"
import { ReserveRatioOverTimeChart } from "./charts/ReserveRatioOverTimeChart"
import { ShenAdaPriceChart } from "./charts/ShenAdaPriceChart"
import { useAnalyticsData, CURRENCY_OPTIONS } from "./useAnalyticsData"
import { ShenMarketCapChart } from "./charts/ShenMarketCapChart"
import { ShenYieldChart } from "./charts/ShenYieldChart"
import { DjedDexPriceChart } from "./charts/DjedDexPriceChart"
import { useTranslations } from "next-intl"
import VolumeChart from "./charts/VolumesChart"

const Analytics = () => {
  const t = useTranslations()
  const {
    translatedPeriodOptions,
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCPeriod,
    djedMCHistoricalData,
    djedMCCurrency,
    setDjedMCCurrency,
    setDjedMCPeriod,
    shenAdaHistoricalData,
    shenAdaPricePeriod,
    setShenAdaPricePeriod,
    shenAdaCurrency,
    setShenAdaCurrency,
    shenMCPeriod,
    shenMCCurrency,
    setShenMCCurrency,
    setShenMCPeriod,
    shenMCHistoricalData,
    volumesCurrency,
    volumesHistoricalData,
    volumesPeriod,
    setVolumesCurrency,
    setVolumesPeriod,
    djedDexCurrency,
    djedDexHistoricalData,
    djedDexPeriod,
    setDjedDexCurrency,
    setDjedDexPeriod,
    shenYieldData,
    projectedYield,
    shenYieldPeriod,
    setShenYieldPeriod,
  } = useAnalyticsData()
  const { reserveRatio, reserveBounds, percentage, reserveChartWarning } =
    useReserveDetails()
  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      {/* Header */}
      <div className="desktop:flex-row flex flex-col justify-between gap-12">
        <div className="desktop:gap-6 flex flex-col gap-4">
          <h2 className="font-bold">{t("analytics.analyticsOverview")}</h2>
          <span className="text-secondary text-sm">
            {t("analytics.description")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="desktop:gap-24 desktop:pt-32 grid grid-cols-1 gap-16 pt-16">
        <ChartCard
          period={reserveRatioPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setReserveRatioPeriod}
          title={t("analytics.reserveRatioOverTime")}
          warning={
            reserveChartWarning
              ? {
                  message: reserveChartWarning,
                  type: "warning",
                }
              : undefined
          }
          info={
            reserveBounds !== "in-bounds"
              ? {
                  currentRatio: Number(reserveRatio.toFixed(0)),
                  percentage: Number(percentage.toFixed(0)),
                  type: reserveBounds,
                }
              : undefined
          }
        >
          <ReserveRatioOverTimeChart data={reserveRatioData} />
        </ChartCard>
      </div>
      <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-cols-1 gap-16 py-24">
        <ChartCard
          title={t("analytics.djedMarketCap")}
          period={djedMCPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setDjedMCPeriod}
          currency={djedMCCurrency}
          onCurrencyChange={setDjedMCCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
        >
          <DjedMarketCapChart
            data={djedMCHistoricalData}
            currency={djedMCCurrency}
          />
        </ChartCard>
        <ChartCard
          title={t("analytics.shenMarketCap")}
          period={shenMCPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setShenMCPeriod}
          currency={shenMCCurrency}
          onCurrencyChange={setShenMCCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
        >
          <ShenMarketCapChart
            data={shenMCHistoricalData}
            currency={shenMCCurrency}
          />
        </ChartCard>
      </div>

      <div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard
          title={t("analytics.volumes")}
          period={volumesPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setVolumesPeriod}
          currency={volumesCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
          onCurrencyChange={setVolumesCurrency}
        >
          <VolumeChart
            data={volumesHistoricalData}
            currency={volumesCurrency}
          />
        </ChartCard>
      </div>

      <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-cols-1 gap-16 py-24">
        <ChartCard
          period={shenAdaPricePeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setShenAdaPricePeriod}
          currency={shenAdaCurrency}
          onCurrencyChange={setShenAdaCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
          title={t("analytics.shenAdaPrice")}
        >
          <ShenAdaPriceChart
            data={shenAdaHistoricalData}
            currency={shenAdaCurrency}
          />
        </ChartCard>

        <ChartCard
          title={t("common.yield", { token: "SHEN" })}
          period={shenYieldPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setShenYieldPeriod}
        >
          <ShenYieldChart data={[...shenYieldData, ...projectedYield]} />
        </ChartCard>
      </div>

      <div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard
          title={t("analytics.djedDexPrice")}
          period={djedDexPeriod}
          periodItems={translatedPeriodOptions}
          onPeriodChange={setDjedDexPeriod}
          currency={djedDexCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
          onCurrencyChange={setDjedDexCurrency}
        >
          <DjedDexPriceChart
            data={djedDexHistoricalData}
            currency={djedDexCurrency}
          />
        </ChartCard>
      </div>
    </div>
  )
}

export default Analytics
