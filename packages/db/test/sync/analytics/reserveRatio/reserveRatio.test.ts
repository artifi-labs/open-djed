import { describe, expect, test } from "vitest"
import { reserveRatio as calculateReserveRatio } from "@open-djed/math"
import type {
  DailyUTxOs,
  OrderedPoolOracleTxOs,
  DailyReserveRatioUTxOsWithWeights,
} from "../../../../src/sync/types"
import {
  assignTimeWeightsToReserveRatioDailyUTxOs,
  getTimeWeightedDailyReserveRatio,
} from "../../../../src/sync/analytics/reserveRatio/timeWeighting"
import { MS_PER_DAY } from "../../../../src/sync/utils"
import { mockPool, mockOracle, dailyChunks } from "../../../utils/helpers"
import {
  oracleDatumA,
  oracleDatumB,
  poolDatumA,
  poolDatumB,
} from "../../../factories/datumFactory"

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
          day: "2026-02-01",
          startIso: "2026-02-01T00:00:00.000Z",
          endIso: "2026-02-01T23:59:59.999Z",
          entries: [
            {
              key: "pool",
              value: {
                ...mockPool,
                timestamp: "2026-02-01T00:30:00.000Z",
                block_hash: "pool-block-1",
                block_slot: 1,
              },
            },
            {
              key: "pool",
              value: {
                ...mockPool,
                timestamp: "2026-02-01T02:00:00.000Z",
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
          day: "2026-02-01",
          startIso: "2026-02-01T00:00:00.000Z",
          endIso: "2026-02-01T23:59:59.999Z",
          entries: [
            {
              key: "oracle",
              value: {
                ...mockOracle,
                timestamp: "2026-02-01T01:15:00.000Z",
                block_hash: "oracle-block-1",
                block_slot: 1,
              },
            },
            {
              key: "oracle",
              value: {
                ...mockOracle,
                timestamp: "2026-02-01T03:00:00.000Z",
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
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2026-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2026-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "pool",
            value: {
              poolDatum: poolDatumB,
              timestamp: "2026-02-01T02:00:00.000Z",
              block_hash: "pool-block-2",
              block_slot: 3,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumB,
              timestamp: "2026-02-01T04:00:00.000Z",
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
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2026-02-01T00:30:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2026-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumB,
              timestamp: "2026-02-01T04:00:00.000Z",
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
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2026-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2026-02-01T23:59:59.000Z",
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
        day: "2026-02-01",
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-01T23:59:59.999Z",
        entries: [
          {
            key: "pool",
            value: {
              poolDatum: poolDatumA,
              timestamp: "2026-02-01T00:00:00.000Z",
              block_hash: "pool-block-1",
              block_slot: 1,
            },
          },
          {
            key: "oracle",
            value: {
              oracleDatum: oracleDatumA,
              timestamp: "2026-02-01T01:00:00.000Z",
              block_hash: "oracle-block-1",
              block_slot: 2,
            },
          },
          {
            key: "pool",
            value: {
              poolDatum: poolDatumB,
              timestamp: "2026-02-01T01:00:00.000Z", // same as previous
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
    const result = assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)
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
      start: "2026-02-01T00:30:00.000Z",
      end: "2026-02-01T01:15:00.000Z",
    })

    // entry[2] (pool @ 02:00) should use PREVIOUS active datums: pool(A) + oracle(A)
    expect(entries[2].usedPoolDatum).toEqual(poolDatumA)
    expect(entries[2].usedOracleDatum).toEqual(oracleDatumA)
    expect(entries[2].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumA).toNumber(),
    )
    expect(entries[2].period).toEqual({
      start: "2026-02-01T01:15:00.000Z",
      end: "2026-02-01T02:00:00.000Z",
    })

    // entry[3] (oracle @ 03:00) should use PREVIOUS active datums: Pool(B) + Oracle(A)
    expect(entries[3].usedPoolDatum).toEqual(poolDatumB)
    expect(entries[3].usedOracleDatum).toEqual(oracleDatumA)
    expect(entries[3].ratio).toBe(
      calculateReserveRatio(poolDatumB, oracleDatumA).toNumber(),
    )
    expect(entries[3].period).toEqual({
      start: "2026-02-01T03:00:00.000Z",
      end: "2026-02-01T23:59:59.999Z",
    })
  })
  //#endregion "TC-3"

  //#region "TC-4"
  test("TC-4: active pool/oracle datums persist across day chunks", () => {
    const day1: DailyUTxOs = {
      day: "2026-02-01",
      startIso: "2026-02-01T00:00:00.000Z",
      endIso: "2026-02-01T23:59:59.999Z",
      entries: [
        {
          key: "pool",
          value: {
            poolDatum: poolDatumA,
            timestamp: "2026-02-01T22:00:00.000Z",
            block_hash: "day1-pool-A",
            block_slot: 10,
          },
        },
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumA,
            timestamp: "2026-02-01T23:00:00.000Z",
            block_hash: "day1-oracle-A",
            block_slot: 11,
          },
        },
      ] as OrderedPoolOracleTxOs[],
    }

    const day2: DailyUTxOs = {
      day: "2026-02-02",
      startIso: "2026-02-02T00:00:00.000Z",
      endIso: "2026-02-02T23:59:59.999Z",
      entries: [
        {
          key: "oracle",
          value: {
            oracleDatum: oracleDatumB, // oracle updates first on day2
            timestamp: "2026-02-02T01:00:00.000Z",
            block_hash: "day2-oracle-B",
            block_slot: 20,
          },
        },
        {
          key: "pool",
          value: {
            poolDatum: poolDatumB, // pool updates later on day2 (last)
            timestamp: "2026-02-02T02:00:00.000Z",
            block_hash: "day2-pool-B",
            block_slot: 21,
          },
        },
      ] as OrderedPoolOracleTxOs[],
    }

    const result = assignTimeWeightsToReserveRatioDailyUTxOs([day1, day2])

    const day2Entries = result[1].entries

    // Day2 entry[0] (oracle @ 01:00) should compute ratio using Pool(A) + Oracle(A) from day 1
    expect(day2Entries[0].usedPoolDatum).toEqual(poolDatumA)
    expect(day2Entries[0].usedOracleDatum).toEqual(oracleDatumA)
    expect(day2Entries[0].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumA).toNumber(),
    )
    expect(day2Entries[0].period).toEqual({
      start: "2026-02-02T00:00:00.000Z",
      end: "2026-02-02T01:00:00.000Z",
    })

    // Day2 entry[1] (pool @ 02:00) should use compute ratio using Pool(A) + Oracle(B)
    expect(day2Entries[1].usedPoolDatum).toEqual(poolDatumA)
    expect(day2Entries[1].usedOracleDatum).toEqual(oracleDatumB)
    expect(day2Entries[1].ratio).toBe(
      calculateReserveRatio(poolDatumA, oracleDatumB).toNumber(),
    )
    expect(day2Entries[1].period).toEqual({
      start: "2026-02-02T02:00:00.000Z",
      end: "2026-02-02T23:59:59.999Z",
    })

    expect(day2Entries[1].weight).toBe(79_199_999)
  })
  //#endregion "TC-4"
})

describe("getTimeWeightedDailyReserveRatio", () => {
  //#region "TC-1"
  test("TC-1: computes correct time-weighted daily reserve ratio", () => {
    const resultWeighted =
      assignTimeWeightsToReserveRatioDailyUTxOs(dailyChunks)

    expect(resultWeighted).toHaveLength(1)

    const weightedDay = resultWeighted[0]
    if (!weightedDay) {
      throw new Error("Expected one weighted day chunk but got none")
    }

    /**
     * - dayStart = 00:00:00.000Z
     * - entry[0] @ 00:30:00.000Z => weight = 00:30 - 00:00 = 1,800,000ms
     * - entry[1] @ 01:15:00.000Z => weight = 01:15 - 00:30 = 2,700,000ms
     * - entry[2] @ 02:00:00.000Z => weight = 02:00 - 01:15 = 2,700,000ms
     * - entry[3] @ 03:00:00.000Z => weight = dayEnd(23:59:59.999) - 03:00 = 75,599,999ms
     */
    expect(weightedDay.entries.map((e) => e.weight)).toEqual([
      1_800_000, 2_700_000, 2_700_000, 75_599_999,
    ])

    const enriched: DailyReserveRatioUTxOsWithWeights = {
      ...weightedDay,
      entries: weightedDay.entries.map((e) => {
        if (e.usedPoolDatum && e.usedOracleDatum) {
          return {
            ...e,
            ratio: calculateReserveRatio(
              e.usedPoolDatum,
              e.usedOracleDatum,
            ).toNumber(),
          }
        }
        return e
      }),
    }

    const result = getTimeWeightedDailyReserveRatio([enriched])

    const expected =
      enriched.entries.reduce((sum, e) => {
        if (e.ratio === undefined || e.weight <= 0) return sum
        return sum + e.ratio * e.weight
      }, 0) / MS_PER_DAY

    expect(result).toHaveLength(1)

    const latest = enriched.entries.at(-1)?.value
    if (!latest) {
      throw new Error("Expected at least one entry in the daily chunk")
    }

    expect(result[0]).toEqual({
      timestamp: new Date(latest.timestamp),
      reserveRatio: expected,
      block: latest.block_hash,
      slot: latest.block_slot,
    })
  })
  //#endregion "TC-1"
})
