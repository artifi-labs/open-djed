import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"

export const analyticsKeys = {
  all: ["analytics"] as const,

  reserveRatio: (period: ChartPeriodValue) =>
    [...analyticsKeys.all, "reserveRatio", period] as const,

  marketCap: (token: "DJED" | "SHEN", period: ChartPeriodValue) =>
    [...analyticsKeys.all, "marketCap", token, period] as const,

  shenAdaPrice: (period: ChartPeriodValue) =>
    [...analyticsKeys.all, "shenAdaPrice", period] as const,

  volumes: (period: ChartPeriodValue) =>
    [...analyticsKeys.all, "volumes", period] as const,

  djedDexPrice: (period: ChartPeriodValue) =>
    [...analyticsKeys.all, "djedDexPrice", period] as const,

  shenYield: (period: ChartPeriodValue) =>
    [...analyticsKeys.all, "shenYield", period] as const,

  projectedShenYield: () =>
    [...analyticsKeys.all, "projectedShenYield"] as const,
}
