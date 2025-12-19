import { expect, test } from "vitest"
import { PoolDatum } from "./pool-datum"
import { Data } from "@lucid-evolution/lucid"

const poolDatumCbor =
  "d8799f1b000019d43a9c3db21b0000042d3b79a5431b000011e1ca70acf6d8799fd8799fd8799fd8799f582043281e7116fee7328ae5ce0dfec0bb981c926a395085ad7ac5d3c7daee74ccc1ff00ff1b00000193cf5c8f50ffff1a001bd19a1a001758c2d87a80581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61d8799fd8799f5820362e24ab3b1aacf8108c52aec7ddc6c2e007fef3c3a125eebe849a0be4203902ff00ffd8799fd8799f5820db247c41cee6f2edb9e291a89c29249938bb6a51a81b701731a823964503cfbbff00ffff"
const poolDatumRich: PoolDatum = {
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

test("pool datum from", () => {
  expect(Data.from(poolDatumCbor, PoolDatum)).toEqual(poolDatumRich)
})

test("pool datum to", () => {
  expect(Data.to(poolDatumRich, PoolDatum)).toEqual(
    "d8799f1b000019d43a9c3db21b0000042d3b79a5431b000011e1ca70acf6d8799fd8799fd8799fd8799f582043281e7116fee7328ae5ce0dfec0bb981c926a395085ad7ac5d3c7daee74ccc1ff00ff1b00000193cf5c8f50ffff1a001bd19a1a001758c2d87a80581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61d8799fd8799f5820362e24ab3b1aacf8108c52aec7ddc6c2e007fef3c3a125eebe849a0be4203902ff00ffd8799fd8799f5820db247c41cee6f2edb9e291a89c29249938bb6a51a81b701731a823964503cfbbff00ffff",
  )
})
