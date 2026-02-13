"use client"

import { useReserveDetails } from "@/hooks/useReserveDetails"
import ChartCard from "../card/ChartCard"
import { DjedMarketCapChart } from "./charts/DjedMarketCapChart"
import { ShenMarketCapChart } from "./charts/ShenMarketCapChart"
import { ReserveRatioOverTimeChart } from "./charts/ReserveRatioOverTimeChart"
import {
  useAnalyticsData,
  CHART_PERIOD_OPTIONS,
  CURRENCY_OPTIONS,
} from "./useAnalyticsData"

const Analytics = () => {
  const {
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCPeriod,
    djedMCHistoricalData,
    djedMCCurrency,
    setDjedMCCurrency,
    setDjedMCPeriod,
    shenMCPeriod,
    shenMCHistoricalData,
    setShenMCPeriod,
    shenMCCurrency,
    setShenMCCurrency,
  } = useAnalyticsData()
  const { reserveRatio, reserveBounds, percentage, reserveChartWarning } =
    useReserveDetails()
  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      <div className="desktop:py-32 flex w-full flex-col items-center justify-center gap-8 py-16 text-center">
        <h1 className="font-bold">
          <span className="text-gradient-angular-1">Analytics</span> Overview
        </h1>
        <p className="text-secondary text-xs">
          Real-time insights into protocol metrics and market dynamics
        </p>
      </div>

      <div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard
          period={reserveRatioPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
          onPeriodChange={setReserveRatioPeriod}
          title="Reserve Ratio Over Time"
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
          title="DJED Market Cap"
          period={djedMCPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
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
          title="SHEN Market Cap"
          period={shenMCPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
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
      {/*<div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard title="Volume Analytics"></ChartCard>
      </div>
      <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-cols-1 gap-16 py-24">

        <ChartCard
          period={shenMCPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
          onPeriodChange={setShenMCPeriod}
        >
          <ShenMarketCapChart data={shenMCHistoricalData} currency="USD" />
        </ChartCard>
        <ChartCard
          period={shenAdaPricePeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
          onPeriodChange={setShenAdaPricePeriod}
          currency={shenAdaCurrency}
          onCurrencyChange={setShenAdaCurrency}
          currencyItems={[...CURRENCY_OPTIONS]}
          title="SHEN Price & ADA Price"
        >
          <ShenAdaPriceChart
            data={shenAdaHistoricalData}
            currency={shenAdaCurrency}
          />
        </ChartCard>
        <ChartCard title="SHEN Yield"></ChartCard>
      </div>
      
      <div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard title="DJED Price vs Secondary Markets">
        </ChartCard>
      </div>
      */}
    </div>
  )
}

export default Analytics
