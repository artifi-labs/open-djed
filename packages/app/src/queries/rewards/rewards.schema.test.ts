import { describe, it, expect } from "vitest"
import {
  AddressRewardsResponseSchema,
  CurrentEpochResponseSchema,
  isKnownDistributionStatus,
} from "./rewards.schema"

const SAMPLE = {
  data: [
    {
      epochNumber: 653,
      epochStartTime: "2026-09-01T21:44:51.000Z",
      epochEndTime: "2026-09-06T21:44:51.000Z",
      shenAmount: "300.000132",
      rewardAmount: "0.000000",
      distributionStatus: "snapshot_taken",
      rewardTxHash: null,
    },
    {
      epochNumber: 651,
      epochStartTime: "2026-08-22T21:44:51.000Z",
      epochEndTime: "2026-08-27T21:44:51.000Z",
      shenAmount: "300.000132",
      rewardAmount: "0.042526",
      distributionStatus: "distribution_confirmed",
      rewardTxHash:
        "0390fee2e8454afd5c23d89d795ac6b0128bfaf8677f9b2b37a4c69eb53516ed",
      airDropTxHash:
        "ae18bec0bbb2853851c808b031172601911cea1de2130d05dc5b59a69bb87f3a",
    },
  ],
  totalRewardNotDistributed: "0.781495",
  totalRewardDistributed: "2.023680",
  total: "57",
}

describe("AddressRewardsResponseSchema", () => {
  it("parses the documented payload and coerces amounts to numbers", () => {
    const parsed = AddressRewardsResponseSchema.parse(SAMPLE)
    expect(parsed.data).toHaveLength(2)
    expect(parsed.data[0]?.shenAmount).toBeCloseTo(300.000132, 6)
    expect(parsed.data[1]?.rewardAmount).toBeCloseTo(0.042526, 6)
    expect(parsed.data[0]?.rewardTxHash).toBeNull()
    expect(parsed.data[0]?.airDropTxHash).toBeUndefined()
    expect(parsed.data[1]?.airDropTxHash).toBe(
      "ae18bec0bbb2853851c808b031172601911cea1de2130d05dc5b59a69bb87f3a",
    )
    expect(parsed.total).toBe(57)
    expect(parsed.totalRewardDistributed).toBeCloseTo(2.02368, 5)
  })

  it("accepts an empty data array", () => {
    const parsed = AddressRewardsResponseSchema.parse({ ...SAMPLE, data: [] })
    expect(parsed.data).toEqual([])
  })

  it("rejects a non-numeric amount", () => {
    expect(() =>
      AddressRewardsResponseSchema.parse({
        ...SAMPLE,
        data: [{ ...SAMPLE.data[0], rewardAmount: "N/A" }],
      }),
    ).toThrow()
  })
})

describe("CurrentEpochResponseSchema", () => {
  it("parses the current epoch payload", () => {
    expect(
      CurrentEpochResponseSchema.parse({ currentEpochNumber: 654 })
        .currentEpochNumber,
    ).toBe(654)
  })
})

describe("isKnownDistributionStatus", () => {
  it("recognises documented statuses", () => {
    expect(isKnownDistributionStatus("snapshot_taken")).toBe(true)
    expect(isKnownDistributionStatus("to_be_distrusted")).toBe(true)
    expect(isKnownDistributionStatus("distributed")).toBe(true)
  })

  it("rejects unknown statuses", () => {
    expect(isKnownDistributionStatus("something_new")).toBe(false)
  })
})
