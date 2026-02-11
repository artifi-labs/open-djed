import type { OracleDatum, PoolDatum } from "@open-djed/data"

const createOutputReference = (hash: string, index: bigint) => ({
  txHash: [hash] as [string],
  outputIndex: index,
})

export const createPoolDatum = (
  overrides: Partial<
    Pick<PoolDatum, "adaInReserve" | "djedInCirculation" | "shenInCirculation">
  > = {},
): PoolDatum => ({
  adaInReserve: 29_000_000n,
  djedInCirculation: 4_620_000n,
  shenInCirculation: 21_800_000n,
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

export const createOracleDatum = (
  rate: {
    numerator: bigint
    denominator: bigint
  } = { numerator: 2_618n, denominator: 10_000n },
): OracleDatum => ({
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

export const poolDatumA = createPoolDatum({
  adaInReserve: 29_000_000n,
  djedInCirculation: 4_620_000n,
  shenInCirculation: 21_800_000n,
})

export const poolDatumB = createPoolDatum({
  adaInReserve: 30_500_000n,
  djedInCirculation: 4_900_000n,
  shenInCirculation: 22_600_000n,
})

export const oracleDatumA = createOracleDatum({
  numerator: 2_618n,
  denominator: 10_000n,
})

export const oracleDatumB = createOracleDatum({
  numerator: 2_727n,
  denominator: 10_000n,
})
