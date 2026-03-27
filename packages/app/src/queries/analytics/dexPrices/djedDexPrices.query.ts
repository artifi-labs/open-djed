import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { analyticsKeys } from "../keys"
import { DjedDexPricesResponseSchema } from "@open-djed/api"

type Params = {
  period: ChartPeriodValue
}

export function useDjedDexPricesQuery({ period }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.djedDexPrice(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    queryFn: async () => {
      const res = await client.api["historical-djed-dex-price"].$get({
        query: {
          period: period,
        },
      })

      if (!res.ok) throw new Error("Error fetching DJED DEX prices")

      const json = await res.json()

      const parsed = DjedDexPricesResponseSchema.parse(json)

      return parsed
    },
  })
}
