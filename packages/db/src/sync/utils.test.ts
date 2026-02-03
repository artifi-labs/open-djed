import { describe, it, expect } from "vitest"
import { type DailyUTxOs } from "./types" // adjust path as needed
import type { OracleDatum, PoolDatum } from "@open-djed/data"
import {
  assignTimeWeightsToReserveRatioDailyUTxOs,
  getTimeWeightedDailyReserveRatio,
} from "./utils"

const MS_PER_DAY = 86400000

const createMockPoolDatum = (overrides?: Partial<PoolDatum>): PoolDatum => {
  const base: PoolDatum = {
    adaInReserve: 28399307079090n,
    djedInCirculation: 4592317867331n,
    shenInCirculation: 19661461695734n,
    lastOrder: [
      {
        order: {
          txHash: [
            "43281e7116fee7328ae5ce0dfec0bb981c926a395085ad7ac5d3c7daee74ccc1",
          ],
          outputIndex: 0n,
        },
        time: 1734350770000n,
      },
    ],
    minADA: 1823130n,
    _1: 1530050n,
    _2: null,
    mintingPolicyId: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
    mintingPolicyUniqRef: {
      txHash: [
        "362e24ab3b1aacf8108c52aec7ddc6c2e007fef3c3a125eebe849a0be4203902",
      ],
      outputIndex: 0n,
    },
    _3: {
      txHash: [
        "db247c41cee6f2edb9e291a89c29249938bb6a51a81b701731a823964503cfbb",
      ],
      outputIndex: 0n,
    },
  }
  return { ...base, ...overrides }
}

const createMockOracleDatum = (
  overrides?: Partial<OracleDatum>,
): OracleDatum => {
  const base: OracleDatum = {
    _0: "baf00a3eaa2919ef46bbdc67cfe6b50819a64781189d95317a8183c34bdce1cb32647a5bbe7950c97ec31c601064fbd255bb69a52d8b7c8b1f706e1aba3deb07",
    oracleFields: {
      adaUSDExchangeRate: {
        numerator: 27879n,
        denominator: 50000n,
      },
      validityRange: {
        lowerBound: [
          {
            Value: [1744156444000n],
          },
          null,
        ],
        upperBound: [
          {
            Value: [1744157344000n],
          },
          null,
        ],
      },
      expressedIn: "555344",
    },
    oracleTokenPolicyId:
      "815aca02042ba9188a2ca4f8ce7b276046e2376b4bce56391342299e",
  }
  return { ...base, ...overrides }
}

describe("assignTimeWeightsToDailyUTxOs", () => {
  it("should assign weights to entries in a single day", () => {
    const dailyChunks: DailyUTxOs[] = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T06:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
          },
        ],
      },
    ]

    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].entries).toHaveLength(2)

    // First entry weight should be 6 hours in ms
    expect(result[0].entries[0].weight).toBe(6 * 60 * 60 * 1000)

    // Second entry weight should be remaining time until end of day
    const secondEntryTime = Date.parse("2026-02-01T12:00:00.000Z")
    const dayEnd = Date.parse("2026-02-01T23:59:59.999Z")
    expect(result[0].entries[1].weight).toBe(dayEnd - secondEntryTime)
  })

  it("should handle multiple days with carry-over state", () => {
    const dailyChunks: DailyUTxOs[] = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T18:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
          },
        ],
      },
      {
        day: "2026-02-02",
        startIso: "2026-02-02T00:00:00.000Z",
        endIso: "2026-02-02T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum({ adaInReserve: 1500000n }),
              timestamp: "2026-02-02T10:00:00.000Z",
              block_hash: "hash3",
              block_slot: 3000,
            },
          },
        ],
      },
    ]

    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    expect(result).toHaveLength(2)

    // Check that second day uses data from first day
    expect(result[1].entries[0]).toHaveProperty("usedPoolDatum")
    expect(result[1].entries[0]).toHaveProperty("usedOracleDatum")
  })

  it("should handle empty entries array", () => {
    const dailyChunks: DailyUTxOs[] = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [],
      },
    ]

    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].entries).toHaveLength(0)
  })

  it("should handle single entry in a day", () => {
    const dailyChunks: DailyUTxOs[] = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
          },
        ],
      },
    ]

    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].entries).toHaveLength(1)

    // Single entry should have weight from its timestamp to end of day
    const entryTime = Date.parse("2026-02-01T12:00:00.000Z")
    const dayEnd = Date.parse("2026-02-01T23:59:59.999Z")
    expect(result[0].entries[0].weight).toBe(dayEnd - entryTime)
  })

  it("should correctly set period for entries with previous data", () => {
    const dailyChunks: DailyUTxOs[] = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T06:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T08:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
          },
          {
            key: "pool",
            value: {
              poolDatum: createMockPoolDatum({ adaInReserve: 1200000n }),
              timestamp: "2026-02-01T14:00:00.000Z",
              block_hash: "hash3",
              block_slot: 3000,
            },
          },
        ],
      },
    ]

    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    // Third entry should have period set
    expect(result[0].entries[2]).toHaveProperty("period")
    expect(result[0].entries[2].period).toEqual({
      start: "2026-02-01T14:00:00.000Z",
      end: "2026-02-01T23:59:59.999Z",
    })
  })
})

describe("getTimeWeightedDailyReserveRatio", () => {
  it("should calculate weighted average for a single day", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: MS_PER_DAY / 2, // 12 hours
            ratio: 1.5,
          },
          {
            key: "oracle" as const,
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T18:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
            weight: MS_PER_DAY / 4, // 6 hours
            ratio: 2.0,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].timestamp).toBe("2026-02-01")
    expect(result[0].block).toBe("hash2")
    expect(result[0].slot).toBe(2000)

    // Weighted average: (1.5 * MS_PER_DAY/2 + 2.0 * MS_PER_DAY/4) / MS_PER_DAY
    // = (1.5 * 0.5 + 2.0 * 0.25) = 0.75 + 0.5 = 1.25
    expect(result[0].reserveRatio).toBeCloseTo(1.25, 5)
  })

  it("should skip days with no valid entries", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: 0, // No weight
            ratio: undefined,
          },
        ],
      },
      {
        day: "2026-02-02",
        startIso: "2026-02-02T00:00:00.000Z",
        endIso: "2026-02-02T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-02T12:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
            weight: MS_PER_DAY / 2,
            ratio: 1.5,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].timestamp).toBe("2026-02-02")
  })

  it("should handle multiple days", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T23:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: MS_PER_DAY,
            ratio: 1.0,
          },
        ],
      },
      {
        day: "2026-02-02",
        startIso: "2026-02-02T00:00:00.000Z",
        endIso: "2026-02-02T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-02T23:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
            weight: MS_PER_DAY,
            ratio: 2.0,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(2)
    expect(result[0].timestamp).toBe("2026-02-01")
    expect(result[0].reserveRatio).toBe(1.0)
    expect(result[1].timestamp).toBe("2026-02-02")
    expect(result[1].reserveRatio).toBe(2.0)
  })

  it("should skip entries with undefined ratio", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: MS_PER_DAY / 2,
            ratio: undefined,
          },
          {
            key: "oracle" as const,
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T18:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
            weight: MS_PER_DAY / 2,
            ratio: 2.0,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(1)
    // Only the second entry should contribute
    expect(result[0].reserveRatio).toBe(1.0) // 2.0 * (MS_PER_DAY/2) / MS_PER_DAY
  })

  it("should skip entries with zero or negative weight", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T12:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: 0,
            ratio: 1.5,
          },
          {
            key: "oracle" as const,
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T18:00:00.000Z",
              block_hash: "hash2",
              block_slot: 2000,
            },
            weight: -1000,
            ratio: 2.0,
          },
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T20:00:00.000Z",
              block_hash: "hash3",
              block_slot: 3000,
            },
            weight: MS_PER_DAY,
            ratio: 3.0,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].reserveRatio).toBe(3.0)
  })

  it("should use latest entry for metadata", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool" as const,
            value: {
              poolDatum: createMockPoolDatum(),
              timestamp: "2026-02-01T10:00:00.000Z",
              block_hash: "hash1",
              block_slot: 1000,
            },
            weight: MS_PER_DAY / 2,
            ratio: 1.5,
          },
          {
            key: "oracle" as const,
            value: {
              oracleDatum: createMockOracleDatum(),
              timestamp: "2026-02-01T20:00:00.000Z",
              block_hash: "latest_hash",
              block_slot: 9999,
            },
            weight: MS_PER_DAY / 2,
            ratio: 2.0,
          },
        ],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)

    expect(result).toHaveLength(1)
    expect(result[0].block).toBe("latest_hash")
    expect(result[0].slot).toBe(9999)
    expect(result[0].timestamp).toBe("2026-02-01")
  })

  it("should handle empty chunks array", () => {
    const result = getTimeWeightedDailyReserveRatio([])
    expect(result).toHaveLength(0)
  })

  it("should skip chunks with empty entries", () => {
    const dailyChunks = [
      {
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [],
      },
    ]

    const result = getTimeWeightedDailyReserveRatio(dailyChunks)
    expect(result).toHaveLength(0)
  })
})
