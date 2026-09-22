export const rewardsKeys = {
  all: ["rewards"] as const,
  currentEpoch: () => [...rewardsKeys.all, "currentEpoch"] as const,
  byAddress: (address: string, limit: number, offset: number) =>
    [...rewardsKeys.all, "byAddress", address, { limit, offset }] as const,
}
