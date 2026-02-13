import type {
  DailyUTxOs,
  OracleUTxoWithDatumAndTimestamp,
  OrderedPoolOracleTxOs,
  PoolUTxoWithDatumAndTimestamp,
} from "../../src/sync/types"
import {
  oracleDatumA,
  oracleDatumB,
  poolDatumA,
  poolDatumB,
} from "../factories/datumFactory"

export const mockPool: PoolUTxoWithDatumAndTimestamp = {
  poolDatum: poolDatumA,
  timestamp: "2026-02-01T00:30:00.000Z",
  block_hash: "mock-pool-block",
  block_slot: 1,
}

export const mockOracle: OracleUTxoWithDatumAndTimestamp = {
  oracleDatum: oracleDatumA,
  timestamp: "2026-02-01T01:15:00.000Z",
  block_hash: "mock-oracle-block",
  block_slot: 2,
}

export const dayEntries: OrderedPoolOracleTxOs[] = [
  {
    key: "pool",
    value: {
      ...mockPool,
      poolDatum: poolDatumA,
      timestamp: "2026-02-01T00:30:00.000Z",
      block_hash: "pool-block-1",
      block_slot: 1,
    },
  },
  {
    key: "oracle",
    value: {
      ...mockOracle,
      oracleDatum: oracleDatumA,
      timestamp: "2026-02-01T01:15:00.000Z",
      block_hash: "oracle-block-1",
      block_slot: 2,
    },
  },
  {
    key: "pool",
    value: {
      ...mockPool,
      poolDatum: poolDatumB,
      timestamp: "2026-02-01T02:00:00.000Z",
      block_hash: "pool-block-2",
      block_slot: 3,
    },
  },
  {
    key: "oracle",
    value: {
      ...mockOracle,
      oracleDatum: oracleDatumB,
      timestamp: "2026-02-01T03:00:00.000Z",
      block_hash: "oracle-block-2",
      block_slot: 4,
    },
  },
]

export const dailyChunks: DailyUTxOs[] = [
  {
    day: "2026-02-01",
    startIso: "2026-02-01T00:00:00.000Z",
    endIso: "2026-02-01T23:59:59.999Z",
    entries: dayEntries,
  },
]
