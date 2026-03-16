import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { calculateProjectedYield } from "@/lib/projectedYield"
import { analyticsKeys } from "../keys"
import { ShenYieldResponseSchema } from "./shenYield.schema"

type Params = {
  period: ChartPeriodValue
}

export function useShenYieldQuery({ period }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.shenYield(period),
    staleTime: 1000 * 60 * 5, //5 minutes
    gcTime: 1000 * 60 * 10, //10 minutes

    queryFn: async () => {
      const res = await client.api["historical-shen-yield"].$get({
        query: {
          period: period,
        },
      })

      if (!res.ok) throw new Error("Error fetching shen yield")

      const json = await res.json()
      const parsed = ShenYieldResponseSchema.parse(json)
      const historicalData = [...parsed]
      if (period === "All") historicalData.shift()

      return historicalData.map((entry) => ({
        ...entry,
        isProjected: false,
      }))
    },
  })
}

export function useProjectedShenYieldQuery() {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.projectedShenYield(),
    staleTime: 1000 * 60 * 5, //5 minutes
    gcTime: 1000 * 60 * 10, //10 minutes

    queryFn: async () => {
      const res = await client.api["projected-shen-yield"].$get()

      if (!res.ok) throw new Error("Error fetching projected shen yield source")

      const json = await res.json()
      const parsed = ShenYieldResponseSchema.parse(json)

      return calculateProjectedYield(
        parsed.map((entry) => ({
          ...entry,
          isProjected: false,
        })),
      )
    },
  })
}
