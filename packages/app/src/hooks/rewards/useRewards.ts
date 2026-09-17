import { useState } from "react"
import { useWallet } from "@/context/WalletContext"
import {
  useAddressRewardsQuery,
  useCurrentEpochQuery,
} from "@/queries/rewards/rewards.query"

export const REWARDS_PER_PAGE = 10

export const useRewards = () => {
  const { wallet } = useWallet()
  const address = wallet?.address ?? null

  const [page, setPage] = useState(1)

  const rewardsQuery = useAddressRewardsQuery({
    address,
    limit: REWARDS_PER_PAGE,
    offset: (page - 1) * REWARDS_PER_PAGE,
  })
  const epochQuery = useCurrentEpochQuery()

  const totalCount = rewardsQuery.data?.total ?? 0

  return {
    epochs: rewardsQuery.data?.data ?? [],
    totalDistributed: rewardsQuery.data?.totalRewardDistributed ?? null,
    totalPending: rewardsQuery.data?.totalRewardNotDistributed ?? null,
    currentEpoch: epochQuery.data ?? null,

    totalCount,
    totalPages: Math.ceil(totalCount / REWARDS_PER_PAGE),
    page,
    setPage,

    statsLoading: rewardsQuery.isPending || epochQuery.isPending,
    tableLoading: rewardsQuery.isPending || rewardsQuery.isPlaceholderData,
  }
}
