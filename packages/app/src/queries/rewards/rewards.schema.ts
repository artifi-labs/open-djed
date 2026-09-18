import { z } from "zod"

export const RewardEpochSchema = z.object({
  epochNumber: z.number().int(),
  epochStartTime: z.string(),
  epochEndTime: z.string(),
  shenAmount: z.coerce.number(),
  rewardAmount: z.coerce.number(),
  distributionStatus: z.string(),
  rewardTxHash: z.string().nullable(),
  airDropTxHash: z.string().nullish(),
})
export type RewardEpoch = z.infer<typeof RewardEpochSchema>

export const AddressRewardsResponseSchema = z.object({
  data: z.array(RewardEpochSchema),
  totalRewardNotDistributed: z.coerce.number(),
  totalRewardDistributed: z.coerce.number(),
  total: z.coerce.number(),
})
export type AddressRewardsResponse = z.infer<
  typeof AddressRewardsResponseSchema
>

export const CurrentEpochResponseSchema = z.object({
  currentEpochNumber: z.number().int(),
})

/**
 * Known values of `distributionStatus`, anything else falls back to raw text.
 */
export const KNOWN_DISTRIBUTION_STATUSES = [
  "snapshot_taken",
  "to_be_distrusted", // This is a typo in the API, but we must keep it to match the real value.
  "distribution_confirmed",
  "distributed",
] as const
export type KnownDistributionStatus =
  (typeof KNOWN_DISTRIBUTION_STATUSES)[number]

export const isKnownDistributionStatus = (
  status: string,
): status is KnownDistributionStatus =>
  (KNOWN_DISTRIBUTION_STATUSES as readonly string[]).includes(status)
