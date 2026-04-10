import { maxReserveRatio, minReserveRatio } from "@open-djed/math"
import { useProtocolData } from "./useProtocolData"
import { useTranslations } from "next-intl"
import type { ReserveBoundsType } from "@/hooks/dashboard"

export const useReserveDetails = () => {
  const t = useTranslations()
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
        ? t("reserve.warning.below", { percentage: minRatio })
        : t("reserve.warning.above", { percentage: maxRatio })

  const reserveChartWarning: string | null =
    reserveBounds === "in-bounds"
      ? null
      : reserveBounds === "below"
        ? t("analytics.reserve.warning.below")
        : t("analytics.reserve.warning.above")

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
