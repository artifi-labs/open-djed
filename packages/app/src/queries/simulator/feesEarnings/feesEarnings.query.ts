import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import { simulatorKeys } from "../keys"
import { FeesEarningsRateSchema } from "./feesEarnings.schema"

type Params = {
  startDate: string
  endDate: string
  enabled?: boolean
}

export function useFeesEarningsRateQuery({
  startDate,
  endDate,
  enabled = true,
}: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: simulatorKeys.feesEarnings(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled,
    queryFn: async () => {
      const res = await client.api["historical-fees-earnings"].$get({
        query: {
          startDate,
          endDate,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch fees earnings.")

      const json = await res.json()
      return FeesEarningsRateSchema.parse(json)
    },
  })
}
