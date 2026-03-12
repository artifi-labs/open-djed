import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { analyticsKeys } from "../keys"
import { shenAdaPriceResponseSchema } from "./shenAdaPrice.schema"

type Params = {
  period: ChartPeriodValue
}

export function useShenAdaPriceQuery({ period }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.shenAdaPrice(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    queryFn: async () => {
      const res = await client.api["historical-shen-ada-price"].$get({
        query: {
          period: period,
        },
      })

      if (!res.ok) throw new Error("Error fetching SHEN/ADA price")

      const json = await res.json()
      return shenAdaPriceResponseSchema.parse(json)
    },
  })
}
