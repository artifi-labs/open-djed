import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import { simulatorKeys } from "../keys"
import { StakingRewardsRateSchema } from "./stakingRewards.schema"

type Params = {
  startDate: string
  endDate: string
  enabled?: boolean
}

export function useStakingRewardsRateQuery({
  startDate,
  endDate,
  enabled = true,
}: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: simulatorKeys.stakingRewards(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled,
    queryFn: async () => {
      const res = await client.api["historical-staking-rewards"].$get({
        query: {
          startDate,
          endDate,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch staking rewards.")

      const json = await res.json()
      return StakingRewardsRateSchema.parse(json)
    },
  })
}
