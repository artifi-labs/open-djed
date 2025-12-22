import { useReserveDetails } from "@/hooks/useReserveDetails"
import BaseCard from "./card/BaseCard"
import { ReserveGraph } from "./ReserveGraph"
import { formatNumber, formatValue } from "@/lib/utils"
import Divider from "./Divider"

const ReserveDetails = () => {
  const { reserveValueADA, reserveValueUSD, reserveRatio, minRatio, maxRatio } =
    useReserveDetails()

  return (
    <div className="desktop:grid-cols-2 desktop:gap-24 desktop:pt-32 grid grid-cols-1 gap-16 pt-16">
      <BaseCard>
        <div className="desktop:pb-0 flex w-full flex-col justify-between gap-24 pb-12">
          <span className="mb-12 text-sm font-medium">Reserve Ratio</span>
          <ReserveGraph
            currentRatio={reserveRatio}
            minRatio={minRatio}
            maxRatio={maxRatio}
          />
        </div>
      </BaseCard>
      <BaseCard>
        <div className="flex w-full flex-col gap-24">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="inline-flex items-center gap-12">
              <span className="text-secondary text-xs">Current Ratio:</span>
              <span className="text-sm font-medium">
                {formatNumber(reserveRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>
            <div className="inline-flex items-center gap-12">
              <span className="text-secondary text-xs">Min Ratio:</span>
              <span className="text-sm font-medium">
                {formatNumber(minRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>
            <div className="inline-flex items-center gap-12">
              <span className="text-secondary text-xs">Max Ratio:</span>
              <span className="text-sm font-medium">
                {formatNumber(maxRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>
          </div>
          <Divider />
          <div className="inline-flex w-full items-center justify-between">
            <span className="text-secondary text-xs">Reserve Value:</span>
            <div className="inline-flex items-center gap-6">
              <span className="text-secondary text-xs">
                $
                {formatNumber(reserveValueUSD, {
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm font-medium">
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
