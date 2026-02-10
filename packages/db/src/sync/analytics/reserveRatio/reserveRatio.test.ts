import { describe, expect, test } from "vitest"
import { reserveRatio as calculateReserveRatio } from "@open-djed/math"
import type { OracleDatum, PoolDatum } from "@open-djed/data"
import type {
  DailyUTxOs,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
} from "../../types"
import { assignTimeWeightsToReserveRatioDailyUTxOs } from "./reserveRatio"

const createOutputReference = (hash: string, index: bigint) => ({
  txHash: [hash] as [string],
  outputIndex: index,
})

const createPoolDatum = (
  overrides: Partial<
    Pick<PoolDatum, "adaInReserve" | "djedInCirculation" | "shenInCirculation">
  > = {},
): PoolDatum => ({
  adaInReserve: 1_000n,
  djedInCirculation: 500n,
  shenInCirculation: 250n,
  lastOrder: [
    {
      order: createOutputReference("mock-pool-last-order", 0n),
      time: 1n,
    },
  ],
  minADA: 1n,
  _1: 0n,
  _2: null,
  mintingPolicyId: "mock-pool-policy",
  mintingPolicyUniqRef: createOutputReference("mock-pool-uniq", 1n),
  _3: createOutputReference("mock-pool-ref", 2n),
  ...overrides,
})

const createOracleDatum = (rate: {
  numerator: bigint
  denominator: bigint
}): OracleDatum => ({
  _0: "mock-oracle-datum",
  oracleFields: {
    adaUSDExchangeRate: rate,
    validityRange: {
      lowerBound: [{ Value: [0n] as [bigint] }, null],
      upperBound: [{ Value: [1n] as [bigint] }, null],
    },
    expressedIn: "555344",
  },
  oracleTokenPolicyId: "mock-oracle-policy",
})

const poolDatumA = createPoolDatum({
  adaInReserve: 1_000n,
  djedInCirculation: 250n,
  shenInCirculation: 100n,
})

const poolDatumB = createPoolDatum({
  adaInReserve: 2_000n,
  djedInCirculation: 350n,
  shenInCirculation: 150n,
})

const oracleDatumA = createOracleDatum({
  numerator: 3n,
  denominator: 1n,
})

const oracleDatumB = createOracleDatum({
  numerator: 5n,
  denominator: 2n,
})

const mockPool: PoolUTxoWithDatumAndTimestamp = {
  poolDatum: poolDatumA,
  timestamp: "2025-02-01T00:30:00.000Z",
  block_hash: "mock-pool-block",
  block_slot: 1,
}

const mockOracle: OracleUTxoWithDatumAndTimestamp = {
  oracleDatum: oracleDatumA,
  timestamp: "2025-02-01T01:15:00.000Z",
  block_hash: "mock-oracle-block",
  block_slot: 2,
}

const dayEntries: OrderedPoolOracleTxOs[] = [
  {
    key: "pool",
    value: {
      ...mockPool,
      poolDatum: poolDatumA,
      timestamp: "2025-02-01T00:30:00.000Z",
      block_hash: "pool-block-1",
      block_slot: 1,
    },
  },
  {
    key: "oracle",
    value: {
      ...mockOracle,
      oracleDatum: oracleDatumA,
      timestamp: "2025-02-01T01:15:00.000Z",
      block_hash: "oracle-block-1",
      block_slot: 2,
    },
  },
  {
    key: "pool",
    value: {
      ...mockPool,
      poolDatum: poolDatumB,
      timestamp: "2025-02-01T02:00:00.000Z",
      block_hash: "pool-block-2",
      block_slot: 3,
    },
  },
  {
    key: "oracle",
    value: {
      ...mockOracle,
      oracleDatum: oracleDatumB,
      timestamp: "2025-02-01T03:00:00.000Z",
      block_hash: "oracle-block-2",
      block_slot: 4,
    },
  },
]

const dailyChunks: DailyUTxOs[] = [
  {
    day: "2025-02-01",
    startIso: "2025-02-01T00:00:00.000Z",
    endIso: "2025-02-01T23:59:59.999Z",
    entries: dayEntries,
  },
]

describe("assignTimeWeightsToReserveRatioDailyUTxOs", () => {
  //#region "TC-1"
  test.each([
    {
      name: "Variant 1 - single day with pool/oracle alternating",
      chunks: dailyChunks,
    },
    {
      name: "Variant 2 - single day with only pool entries",
      chunks: [
        {
          day: "2025-02-01",
          startIso: "2025-02-01T00:00:00.000Z",
          endIso: "2025-02-01T23:59:59.999Z",
          entries: [
            {
              key: "pool",
              value: {
                ...mockPool,
                timestamp: "2025-02-01T00:30:00.000Z",
                block_hash: "pool-block-1",
                block_slot: 1,
              },
            },
            {
              key: "pool",
              value: {
                ...mockPool,
                timestamp: "2025-02-01T02:00:00.000Z",
                block_hash: "pool-block-2",
                block_slot: 2,
              },
            },
          ],
        },
      ] as DailyUTxOs[],
    },
    {
      name: "Variant 3 - single day with only oracle entries",
      chunks: [
        {
          day: "2025-02-01",
          startIso: "2025-02-01T00:00:00.000Z",
          endIso: "2025-02-01T23:59:59.999Z",
          entries: [
            {
              key: "oracle",
              value: {
                ...mockOracle,
                timestamp: "2025-02-01T01:15:00.000Z",
                block_hash: "oracle-block-1",
                block_slot: 1,
              },
            },
            {
              key: "oracle",
              value: {
                ...mockOracle,
                timestamp: "2025-02-01T03:00:00.000Z",
                block_hash: "oracle-block-2",
                block_slot: 2,
              },
            },
          ],
        },
      ] as DailyUTxOs[],
    },
  ])(
    "TC-1: assigns a non-negative weight to every entry ($name)",
    ({ chunks }) => {
      const result = assignTimeWeightsToReserveRatioDailyUTxOs(chunks)

      for (const chunk of result) {
        for (const entry of chunk.entries) {
          expect(entry).toHaveProperty("weight")
          expect(typeof entry.weight).toBe("number")
          expect(entry.weight).toBeGreaterThanOrEqual(0)
        }
      }
    },
  )
  //#endregion "TC-1"

  //#region "TC-2"
  test.each([
    {
      name: "Variant 1 - ordered timestamps starting at dayStart - first weight is 0, last covers to dayEnd",
      chunk: {
        day: "2025-02-01",
        startIso: "2025-02-01T00:00:00.000Z",
        endIso: "2025-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2025-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2025-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "pool",
            value: {
              poolDatum: poolDatumB,
              timestamp: "2025-02-01T02:00:00.000Z",
              block_hash: "pool-block-2",
              block_slot: 3,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumB,
              timestamp: "2025-02-01T04:00:00.000Z",
              block_hash: "oracle-block-2",
              block_slot: 4,
            },
          },
        ] as OrderedPoolOracleTxOs[],
      } satisfies DailyUTxOs,
      expectedWeights: [0, 3_600_000, 3_600_000, 71_999_999],
    },
    {
      name: "Variant 2 - first entry after dayStart (gap at start)",
      chunk: {
        day: "2025-02-01",
        startIso: "2025-02-01T00:00:00.000Z",
        endIso: "2025-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2025-02-01T00:30:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2025-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumB,
              timestamp: "2025-02-01T04:00:00.000Z",
              block_hash: "oracle-block-2",
              block_slot: 3,
            },
          },
        ] as OrderedPoolOracleTxOs[],
      } satisfies DailyUTxOs,
      // 00:00 -> 00:30 = 1_800_000
      // 00:30 -> 01:00 = 1_800_000
      // last: 04:00 -> dayEnd = 71,999,999ms
      expectedWeights: [1_800_000, 1_800_000, 71_999_999],
    },
    {
      name: "Variant 3 - last entry close to dayEnd",
      chunk: {
        day: "2025-02-01",
        startIso: "2025-02-01T00:00:00.000Z",
        endIso: "2025-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2025-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2025-02-01T23:59:59.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
        ] as OrderedPoolOracleTxOs[],
      } satisfies DailyUTxOs,
      // first: 00:00 - 00:00 = 0
      // last: 23:59:59.999 - 23:59:59.000 = 999ms
      expectedWeights: [0, 999],
    },
    {
      name: "Variant 4 - two consecutive entries with same timestamp",
      chunk: {
        day: "2025-02-01",
        startIso: "2025-02-01T00:00:00.000Z",
        endIso: "2025-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2025-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2025-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "pool",
            value: {
              poolDatum: poolDatumB,
              timestamp: "2025-02-01T01:00:00.000Z", // same as previous
              block_hash: "pool-block-2",
              block_slot: 3,
            },
          },
        ] as OrderedPoolOracleTxOs[],
      } satisfies DailyUTxOs,
      // first: 0
      // second: 3_600_000
      // last: dayEnd - 01:00 = 22:59:59.999 = 82,799,999ms
      expectedWeights: [0, 3_600_000, 82_799_999],
    },
  ])(
    "TC-2: correct weight assignment and boundaries ($name)",
    ({ chunk, expectedWeights }) => {
      const result = assignTimeWeightsToReserveRatioDailyUTxOs([chunk])
      const entries = result[0].entries

      expect(entries).toHaveLength(expectedWeights.length)

      entries.forEach((entry, index) => {
        expect(entry.weight).toBe(expectedWeights[index])
        expect(entry.weight).toBeGreaterThanOrEqual(0)
      })
    },
  )
  //#endregion "TC-2"

  //#region "TC-3"
  test("TC-3: active pool/oracle datums are propagated within a single day", () => {
    const chunk: DailyUTxOs = {
      day: "2025-02-01",
      startIso: "2025-02-01T00:00:00.000Z",
      endIso: "2025-02-01T23:59:59.999Z",
      entries: [
        {
          key: "pool",
          value: {
            poolDatum: poolDatumA, // pool(A)
            timestamp: "2025-02-01T00:00:00.000Z",
            block_hash: "pool-block-A",
            block_slot: 1,
          },
        },
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumA, // oracle(A)
            timestamp: "2025-02-01T01:00:00.000Z",
            block_hash: "oracle-block-A",
            block_slot: 2,
          },
        },
        {
          key: "pool",
          value: {
            poolDatum: poolDatumB, // pool(B)
            timestamp: "2025-02-01T02:00:00.000Z",
            block_hash: "pool-block-B",
            block_slot: 3,
          },
        },
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumB, // oracle(B)
            timestamp: "2025-02-01T03:00:00.000Z",
            block_hash: "oracle-block-B",
            block_slot: 4,
          },
        },
      ] as OrderedPoolOracleTxOs[],
    }

    const result = assignTimeWeightsToReserveRatioDailyUTxOs([chunk])
    const entries = result[0].entries

    // First entry still lacks a complete pair.
    expect(entries[0].ratio).toBeUndefined()
    expect(entries[0].period).toBeUndefined()

    // The oracle datum at entry[1] should now close the first pair and calculate the ratio.
    expect(entries[1].usedPoolDatum).toEqual(poolDatumA)
    expect(entries[1].usedOracleDatum).toEqual(oracleDatumA)
    expect(entries[1].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumA).toNumber(),
    )
    expect(entries[1].period).toEqual({
      start: "2025-02-01T00:00:00.000Z",
      end: "2025-02-01T01:00:00.000Z",
    })

    // entry[2] (pool @ 02:00) should use PREVIOUS active datums: pool(A) + oracle(A)
    expect(entries[2].usedPoolDatum).toEqual(poolDatumA)
    expect(entries[2].usedOracleDatum).toEqual(oracleDatumA)
    expect(entries[2].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumA).toNumber(),
    )
    expect(entries[2].period).toEqual({
      start: "2025-02-01T01:00:00.000Z",
      end: "2025-02-01T02:00:00.000Z",
    })

    // entry[3] (oracle @ 03:00) should use PREVIOUS active datums: Pool(B) + Oracle(A)
    expect(entries[3].usedPoolDatum).toEqual(poolDatumB)
    expect(entries[3].usedOracleDatum).toEqual(oracleDatumA)
    expect(entries[3].ratio).toBe(
      calculateReserveRatio(poolDatumB, oracleDatumA).toNumber(),
    )
    expect(entries[3].period).toEqual({
      start: "2025-02-01T03:00:00.000Z",
      end: "2025-02-01T23:59:59.999Z",
    })
  })
  //#endregion "TC-3"

  //#region "TC-4"
  test("TC-4: active pool/oracle datums persist across day chunks", () => {
    const day1: DailyUTxOs = {
      day: "2025-02-01",
      startIso: "2025-02-01T00:00:00.000Z",
      endIso: "2025-02-01T23:59:59.999Z",
      entries: [
        {
          key: "pool",
          value: {
            poolDatum: poolDatumA,
            timestamp: "2025-02-01T22:00:00.000Z",
            block_hash: "day1-pool-A",
            block_slot: 10,
          },
        },
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumA,
            timestamp: "2025-02-01T23:00:00.000Z",
            block_hash: "day1-oracle-A",
            block_slot: 11,
          },
        },
      ] as OrderedPoolOracleTxOs[],
    }

    const day2: DailyUTxOs = {
      day: "2025-02-02",
      startIso: "2025-02-02T00:00:00.000Z",
      endIso: "2025-02-02T23:59:59.999Z",
      entries: [
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumB, // oracle updates first on day2
            timestamp: "2025-02-02T01:00:00.000Z",
            block_hash: "day2-oracle-B",
            block_slot: 20,
          },
        },
        {
          key: "pool",
          value: {
            poolDatum: poolDatumB, // pool updates later on day2 (last)
            timestamp: "2025-02-02T02:00:00.000Z",
            block_hash: "day2-pool-B",
            block_slot: 21,
          },
        },
      ] as OrderedPoolOracleTxOs[],
    }

    const result = assignTimeWeightsToReserveRatioDailyUTxOs([day1, day2])

    const day1Entries = result[0].entries
    const day2Entries = result[1].entries

    // Day2 entry[0] (oracle @ 01:00) should compute ratio using Pool(A) + Oracle(A) from day 1
    expect(day2Entries[0].usedPoolDatum).toEqual(poolDatumA)
    expect(day2Entries[0].usedOracleDatum).toEqual(oracleDatumA)
    expect(day2Entries[0].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumA).toNumber(),
    )
    expect(day2Entries[0].period).toEqual({
      start: "2025-02-02T00:00:00.000Z",
      end: "2025-02-02T01:00:00.000Z",
    })

    // Day2 entry[1] (pool @ 02:00) should use compute ratio using Pool(A) + Oracle(B)
    expect(day2Entries[1].usedPoolDatum).toEqual(poolDatumA)
    expect(day2Entries[1].usedOracleDatum).toEqual(oracleDatumB)
    expect(day2Entries[1].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumB).toNumber(),
    )
    expect(day2Entries[1].period).toEqual({
      start: "2025-02-02T02:00:00.000Z",
      end: "2025-02-02T23:59:59.999Z",
    })

    expect(day2Entries[1].weight).toBe(79_199_999)
  })
  //#endregion "TC-4"
})

