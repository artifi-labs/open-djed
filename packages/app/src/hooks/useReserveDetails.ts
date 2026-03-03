import { type ReserveBoundsType } from "@/components/dashboard/useMintBurnAction"
import { maxReserveRatio, minReserveRatio } from "@open-djed/math"
import { useProtocolData } from "./useProtocolData"

export const useReserveDetails = () => {
  const { isLoading, data } = useProtocolData()

  const reserveValueADA = data?.protocolData.reserve.amount || { ADA: 0 }
  const reserveValueUSD = data
    ? data.to(data.protocolData.reserve.amount, "DJED")
    : 0
  const maxRatio = maxReserveRatio.toNumber() * 100
  const minRatio = minReserveRatio.toNumber() * 100
  const reserveRatio = (data?.protocolData.reserve.ratio ?? 0) * 100
  const reserveBounds: ReserveBoundsType =
    reserveRatio >= minRatio && reserveRatio <= maxRatio
      ? "in-bounds"
      : reserveRatio <= minRatio
        ? "below"
        : "above"

  const reserveWarning: string | null =
    reserveBounds === "in-bounds"
      ? null
      : reserveBounds === "below"
        ? `DJED minting and SHEN burning is not permitted when the reserve ratio drops below ${minRatio}%.`
        : `SHEN minting is not permitted when the reserve ratio rises above ${maxRatio}%.`

  const reserveChartWarning: string | null =
    reserveBounds === "in-bounds"
      ? null
      : reserveBounds === "below"
        ? `DJED minting/SHEN burning unavailable: reserve ratio below minimum.`
        : `SHEN minting unavailable: reserve ratio above maximum.`

  const percentage =
    reserveBounds === "in-bounds"
      ? 0
      : reserveBounds === "below"
        ? ((minRatio - reserveRatio) / minRatio) * 100
        : ((reserveRatio - maxRatio) / maxRatio) * 100

  return {
    hasData: !!data,
    reserveValueADA,
    reserveValueUSD,
    maxRatio,
    minRatio,
    reserveBounds,
    reserveRatio,
    reserveWarning,
    reserveChartWarning,
    percentage,
    isLoading,
  }
}
