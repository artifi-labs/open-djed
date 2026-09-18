import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { rewardsKeys } from "./keys"
import { fetchAddressRewards, fetchCurrentEpoch } from "./rewards.api"

const STALE_TIME = 1000 * 60 * 5
const GC_TIME = 1000 * 60 * 10

/** Paginated rewards for the connected holder. Disabled without an address. */
export function useAddressRewardsQuery({
  address,
  limit,
  offset,
}: {
  address: string | null
  limit: number
  offset: number
}) {
  return useQuery({
    queryKey: rewardsKeys.byAddress(address ?? "", limit, offset),
    queryFn: () =>
      fetchAddressRewards({ address: address as string, limit, offset }),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: Boolean(address),
    retry: false,
    placeholderData: keepPreviousData,
  })
}

/** Current Cardano epoch, per the reward API. */
export function useCurrentEpochQuery() {
  return useQuery({
    queryKey: rewardsKeys.currentEpoch(),
    queryFn: fetchCurrentEpoch,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: false,
  })
}
