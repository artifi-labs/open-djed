"use client"

import ChartCard from "../card/ChartCard"
import { DjedMarketCapChart } from "./charts/DjedMarketCapChart"
import { ReserveRatioOverTimeChart } from "./charts/ReserveRatioOverTimeChart"
import { useAnalyticsData, CHART_PERIOD_OPTIONS } from "./useAnalyticsData"

const AnalyticsPage = () => {
  const {
    reserveRatioData,
    reserveRatioPeriod,
    setReserveRatioPeriod,
    djedMCPeriod,
    djedMCHistoricalData,
    setDjedMCPeriod,
  } = useAnalyticsData()
  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      <div className="px-page-margin flex w-full flex-col items-center justify-center gap-8 py-32">
        <p className="text-3xl font-bold">
          <span className="text-supportive-2-500">Analytics</span> Overview
        </p>
        <p className="text-secondary text-xs font-normal">
          Real-time insights into protocol metrics
        </p>
      </div>

      <div className="desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard
          period={reserveRatioPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
          onPeriodChange={setReserveRatioPeriod}
        >
          <ReserveRatioOverTimeChart data={reserveRatioData} />
        </ChartCard>
      </div>
      <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-cols-1 gap-16 py-24">
        <ChartCard
          period={djedMCPeriod}
          periodItems={[...CHART_PERIOD_OPTIONS]}
          onPeriodChange={setDjedMCPeriod}
        >
          <DjedMarketCapChart data={djedMCHistoricalData} currency="USD" />
        </ChartCard>
        <ChartCard></ChartCard>
      </div>
    </div>
  )
}

export default AnalyticsPage
