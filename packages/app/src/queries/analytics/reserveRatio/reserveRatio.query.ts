import { useQuery } from "@tanstack/react-query"
import { ReserveRatioResponseSchema } from "./reserveRatio.schema"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { analyticsKeys } from "../keys"

type Params = {
  period: ChartPeriodValue
}

export function useReserveRatioQuery({ period }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.reserveRatio(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    queryFn: async () => {
      const res = await client.api["historical-reserve-ratio"].$get({
        query: { period },
      })

      if (!res.ok) throw new Error("Error fetching reserve ratio")

      const json = await res.json()

      const parsed = ReserveRatioResponseSchema.parse(json)

      return parsed.map((entry) => ({
        ...entry,
        reserveRatio: Number(entry.reserveRatio) * 100,
      }))
    },
  })
}
