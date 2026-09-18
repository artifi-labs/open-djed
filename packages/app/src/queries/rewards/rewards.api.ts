import { REWARDS_API_URL } from "@/lib/constants"
import {
  AddressRewardsResponseSchema,
  CurrentEpochResponseSchema,
  type AddressRewardsResponse,
} from "./rewards.schema"

export type AddressRewardsParams = {
  address: string
  limit: number
  offset: number
}

function baseUrl(): string {
  if (!REWARDS_API_URL) throw new Error("REWARDS_API_URL is not configured")
  return REWARDS_API_URL
}

export async function fetchAddressRewards(
  params: AddressRewardsParams,
): Promise<AddressRewardsResponse> {
  const res = await fetch(`${baseUrl()}/get-address-rewards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!res.ok)
    throw new Error(`Failed to fetch address rewards (${res.status})`)
  return AddressRewardsResponseSchema.parse(await res.json())
}

export async function fetchCurrentEpoch(): Promise<number> {
  const res = await fetch(`${baseUrl()}/get-current-epoch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })
  if (!res.ok) throw new Error(`Failed to fetch current epoch (${res.status})`)
  return CurrentEpochResponseSchema.parse(await res.json()).currentEpochNumber
}
