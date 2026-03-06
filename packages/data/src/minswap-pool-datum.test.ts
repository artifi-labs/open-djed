import { Constr, Data } from "@lucid-evolution/lucid"
import { expect, test } from "vitest"
import { MinswapPoolDatum } from "./minswap-pool-datum"

const poolDatumCbor =
  "d8799fd8799fd87a9f581c1eae96baf29e27682ea3f815aba361a0c6059d45e4bfbe95bbd2f44affffd8799f4040ffd8799f581cc48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad480014df105553444dff1b000000fe3f6841e11b0000024c96b0fc711b000000a5fcd7aff5184b184bd8799f190e52ffd87980ff"

const poolDatumRich: MinswapPoolDatum = {
  pool_batching_stake_credential: new Constr(1, [
    "1eae96baf29e27682ea3f815aba361a0c6059d45e4bfbe95bbd2f44a",
  ]),
  asset_a: {
    policy_id: "",
    asset_name: "",
  },
  asset_b: {
    policy_id: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad",
    asset_name: "0014df105553444d",
  },
  total_liquidity: 1091985490401n,
  reserve_a: 2527968951409n,
  reserve_b: 712911597557n,
  base_fee_a_numerator: 75n,
  base_fee_b_numerator: 75n,
  fee_sharing_numerator_opt: 3666n,
  allow_dynamic_fee: false,
}

test("pool datum from", () => {
  expect(Data.from(poolDatumCbor, MinswapPoolDatum)).toEqual(poolDatumRich)
})
test("pool datum to", () => {
  expect(Data.to(poolDatumRich, MinswapPoolDatum)).toEqual(poolDatumCbor)
})
