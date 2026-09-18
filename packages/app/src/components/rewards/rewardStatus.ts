import type { Type as TagType } from "@/components/Tag"
import {
  isKnownDistributionStatus,
  type KnownDistributionStatus,
} from "@/queries/rewards/rewards.schema"

/**
 * Maps a reward distribution status to the Tag colour it renders with.
 */
export const STATUS_TAG: Record<KnownDistributionStatus, TagType> = {
  snapshot_taken: "surface",
  to_be_distrusted: "warning", // This is a typo in the API, but we must keep it to match the real value.
  distribution_confirmed: "success",
  distributed: "success",
}

/** Tag colour for a distribution status */
export const getStatusTagType = (status: string): TagType =>
  isKnownDistributionStatus(status) ? STATUS_TAG[status] : "surface"
