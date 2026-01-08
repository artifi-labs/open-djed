import { useReserveDetails } from "@/hooks/useReserveDetails"
import BaseCard from "./card/BaseCard"
import { ReserveGraph } from "./ReserveGraph"
import { formatNumber, formatValue } from "@/lib/utils"
import Divider from "./Divider"

const ReserveDetails = () => {
  const {
    reserveValueADA,
    reserveValueUSD,
    reserveRatio,
    minRatio,
    maxRatio,
    isLoading,
    hasData,
  } = useReserveDetails()

  return (
    <div className="desktop:grid-cols-2 desktop:gap-24 desktop:pt-32 grid grid-cols-1 gap-16 pt-16">
      <BaseCard overlay={isLoading || !hasData}>
        <div className="desktop:pb-0 flex w-full flex-col justify-between gap-24 pb-12">
          <span className="mb-1 text-sm font-medium">Reserve Ratio</span>
          <ReserveGraph
            currentRatio={!hasData ? undefined : reserveRatio}
            minRatio={minRatio}
            maxRatio={maxRatio}
          />
        </div>
      </BaseCard>

      <BaseCard overlay={isLoading || !hasData}>
        <div className="desktop:gap-24 flex w-full flex-col gap-16">
          <div className="flex w-full flex-wrap justify-between gap-x-8 gap-y-4">
            {/* Current Ratio */}
            <div className="flex items-center gap-8">
              <span className="text-secondary text-xs whitespace-nowrap">
                Current Ratio:
              </span>
              <span className="text-primary truncate text-sm font-medium">
                {formatNumber(reserveRatio, { maximumFractionDigits: 2 })} %
              </span>
            </div>

            {/* Min Ratio */}
            <div className="flex items-center gap-8">
              <span className="text-secondary text-xs whitespace-nowrap">
                Min Ratio:
              </span>
              <span className="text-primary truncate text-sm font-medium">
                {minRatio} %
              </span>
            </div>

            {/* Max Ratio */}
            <div className="flex items-center gap-8">
              <span className="text-secondary text-xs whitespace-nowrap">
                Max Ratio:
              </span>
              <span className="text-primary truncate text-sm font-medium">
                {maxRatio} %
              </span>
            </div>
          </div>

          <Divider />

          {/* Reserve Value */}
          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            <span className="text-secondary text-xs whitespace-nowrap">
              Reserve Value
            </span>

            <div className="flex min-w-0 items-center gap-6">
              <span className="text-secondary shrink-0 text-xs">
                $
                {formatNumber(reserveValueUSD, {
                  maximumFractionDigits: 2,
                })}
              </span>

              <span className="text-primary truncate text-sm">
                {formatValue(reserveValueADA)}
              </span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  )
}

export default ReserveDetails
