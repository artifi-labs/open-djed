import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import type { ChartPeriodValue } from "@/components/analytics/useAnalyticsData"
import { analyticsKeys } from "../keys"
import type { TokenMarketCap } from "../../../../../db/generated/prisma/enums"
import { MarketCapResponseSchema } from "./marketCap.schema"

type Params = {
  token: TokenMarketCap
  period: ChartPeriodValue
}

export function useMarketCapQuery({ period, token }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: analyticsKeys.marketCap(token, period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    queryFn: async () => {
      const res = await client.api["historical-market-cap"].$get({
        query: {
          period,
          token: token,
        },
      })

      if (!res.ok) throw new Error("Error fetching market cap")

      const json = await res.json()

      const parsed = MarketCapResponseSchema.parse(json)

      return parsed.map((entry) => ({
        ...entry,
        marketCap: Number(entry.marketCap),
      }))
    },
  })
}
