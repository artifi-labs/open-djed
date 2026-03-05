import { Data } from "@lucid-evolution/lucid"

const WingRidersPoolDatumSchema = Data.Object({
  request_validator_hash: Data.Bytes(),

  asset_a_symbol: Data.Bytes(),
  asset_a_token: Data.Bytes(),

  asset_b_symbol: Data.Bytes(),
  asset_b_token: Data.Bytes(),

  swap_fee_in_basis: Data.Integer(),
  protocol_fee_in_basis: Data.Integer(),
  project_fee_in_basis: Data.Integer(),
  reserve_fee_in_basis: Data.Integer(),

  fee_basis: Data.Integer(),

  agent_fee_ada: Data.Integer(),

  last_interaction: Data.Integer(),

  treasury_a: Data.Integer(),
  treasury_b: Data.Integer(),

  project_treasury_a: Data.Integer(),
  project_treasury_b: Data.Integer(),

  reserve_treasury_a: Data.Integer(),
  reserve_treasury_b: Data.Integer(),

  project_beneficiary: Data.Nullable(Data.Any()),
  reserve_beneficiary: Data.Nullable(Data.Any()),

  pool_specifics: Data.Any(),
})
export type WingRidersPoolDatum = Data.Static<typeof WingRidersPoolDatumSchema>
export const WingRidersPoolDatum =
  WingRidersPoolDatumSchema as unknown as WingRidersPoolDatum
