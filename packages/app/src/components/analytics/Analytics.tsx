"use client"

import ChartCard from "../card/ChartCard"
import { ReserveRatioOverTimeChart } from "./charts/ReserveRatioOverTimeChart"
import { useAnalyticsData, RESERVE_RATIO_OPTIONS } from "./useAnalyticsData"

const AnalyticsPage = () => {
  const { reserveRatioData, reserveRatioPeriod, setReserveRatioPeriod } =
    useAnalyticsData()
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

      <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-cols-1 gap-16">
        <ChartCard
          period={reserveRatioPeriod}
          periodItems={[...RESERVE_RATIO_OPTIONS]}
          onPeriodChange={setReserveRatioPeriod}
        >
          <ReserveRatioOverTimeChart data={reserveRatioData} />
        </ChartCard>
        <ChartCard></ChartCard>
      </div>
    </div>
  )
}

export default AnalyticsPage
