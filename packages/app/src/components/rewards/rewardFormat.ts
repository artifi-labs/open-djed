import { formatNumber } from "@/utils"

/**
 * Reward amount for display. At `snapshot_taken` the reward hasn't been
 * calculated yet, so the API's `0` is not a real value.
 */
export const formatReward = (
  rewardAmount: number,
  distributionStatus: string,
) =>
  distributionStatus === "snapshot_taken"
    ? "-"
    : `${formatNumber(rewardAmount)} ₳`
