import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { analyticsKeys } from "../keys"
import { ShenYieldResponseSchema } from "./shenYield.schema"

type Params = {
  period: ChartPeriodValue
}

export function useShenYieldQuery({ period }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.shenYield(period),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,

    queryFn: async () => {
      const res = await client.api["historical-shen-yield"].$get({
        query: {
          period: period,
          projected: "false",
        },
      })

      if (!res.ok) throw new Error("Error fetching shen yield")

      const json = await res.json()
      return ShenYieldResponseSchema.parse(json)
    },
  })
}

export function useProjectedShenYieldQuery() {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.projectedShenYield(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,

    queryFn: async () => {
      const res = await client.api["historical-shen-yield"].$get({
        query: {
          period: "M",
          projected: "true",
        },
      })

      if (!res.ok) throw new Error("Error fetching projected shen yield source")

      const json = await res.json()
      return ShenYieldResponseSchema.parse(json)
    },
  })
}
