import { Constr, Data } from "@lucid-evolution/lucid"
import { WingRidersPoolDatum } from "./wingriders-pool-datum"
import { expect, test } from "vitest"

const poolDatumCbor =
  "d8799f581cc134d839a64a5dfb9b155869ef3f34280751a622f69958baa8ffd29c4040581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd614c446a65644d6963726f555344181e0500001927101a001e84801b00000191bbdb3ca8000000000000d87a80d87a80d87980ff"

const poolDatumRich: WingRidersPoolDatum = {
  request_validator_hash:
    "c134d839a64a5dfb9b155869ef3f34280751a622f69958baa8ffd29c",
  asset_a_symbol: "",
  asset_a_token: "",
  asset_b_symbol: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
  asset_b_token: "446a65644d6963726f555344",
  swap_fee_in_basis: 30n,
  protocol_fee_in_basis: 5n,
  project_fee_in_basis: 0n,
  reserve_fee_in_basis: 0n,
  fee_basis: 10000n,
  agent_fee_ada: 2000000n,
  last_interaction: 1725433593000n,
  treasury_a: 0n,
  treasury_b: 0n,
  project_treasury_a: 0n,
  project_treasury_b: 0n,
  reserve_treasury_a: 0n,
  reserve_treasury_b: 0n,
  project_beneficiary: null,
  reserve_beneficiary: null,
  pool_specifics: new Constr(0, []),
}

test("pool datum from", () => {
  expect(Data.from(poolDatumCbor, WingRidersPoolDatum)).toEqual(poolDatumRich)
})
test("pool datum to", () => {
  expect(Data.to(poolDatumRich, WingRidersPoolDatum)).toEqual(poolDatumCbor)
})
