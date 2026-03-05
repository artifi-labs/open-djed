import { Data } from "@lucid-evolution/lucid"

const Asset = Data.Object({
  policy_id: Data.Bytes(),
  asset_name: Data.Bytes(),
})
const MinswapPoolDatumSchema = Data.Object({
  pool_batching_stake_credential: Data.Nullable(Data.Any()),
  asset_a: Asset,
  asset_b: Asset,
  total_liquidity: Data.Integer(),
  reserve_a: Data.Integer(),
  reserve_b: Data.Integer(),
  base_fee_a_numerator: Data.Integer(),
  base_fee_b_numerator: Data.Integer(),
  fee_sharing_numerator_opt: Data.Nullable(Data.Integer()),
  allow_dynamic_fee: Data.Boolean(),
})
export type MinswapPoolDatum = Data.Static<typeof MinswapPoolDatumSchema>
export const MinswapPoolDatum =
  MinswapPoolDatumSchema as unknown as MinswapPoolDatum
