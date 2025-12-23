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
          <span className="mb-1 text-sm font-medium">Reserve Ratio</span>
          <ReserveGraph
            currentRatio={reserveRatio}
            minRatio={minRatio}
            maxRatio={maxRatio}
          />
        </div>
      </BaseCard>
      <BaseCard>
        <div className="desktop:gap-24 flex w-full flex-col gap-16">
          <div className="flex w-auto justify-between">
            <div className="inline-flex items-center gap-8">
              <span className="text-secondary text-xs">Current Ratio:</span>
              <span className="text-primary text-sm">
                {formatNumber(reserveRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>

            <div className="inline-flex items-center gap-8">
              <span className="text-secondary text-xs">Min Ratio:</span>
              <span className="text-primary text-sm">
                {formatNumber(minRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>

            <div className="inline-flex items-center gap-8">
              <span className="text-secondary text-xs">Max Ratio:</span>
              <span className="text-primary text-sm">
                {formatNumber(maxRatio, { maximumFractionDigits: 2 })}%
              </span>
            </div>
          </div>
          <Divider />
          <div className="flex w-full items-center">
            <span className="text-secondary flex-1 text-xs">Reserve Value</span>

            <div className="flex items-center gap-6">
              <span className="text-secondary text-xs">
                $
                {formatNumber(reserveValueUSD, {
                  maximumFractionDigits: 2,
                })}
              </span>

              <span className="text-primary text-sm">
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
