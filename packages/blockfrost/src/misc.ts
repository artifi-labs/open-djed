import { z } from "zod"

export type BlockfrostConfig = {
  url: string
  projectId?: string
}

const UTxOsByAddressWithUnitSchema = z.array(
  z.object({
    address: z.string(),
    tx_hash: z.string(),
    output_index: z.number(),
    amount: z.array(
      z.object({
        unit: z.string(),
        quantity: z.string(),
      }),
    ),
    block: z.string(),
    data_hash: z.string().nullable(),
    inline_datum: z.string().nullable(),
    reference_script_hash: z.string().nullable(),
  }),
)

export const getUTxOsByAddressWithUnit = (
  config: BlockfrostConfig,
  address: string,
  unit: string,
) =>
  fetch(`${config.url}/addresses/${address}/utxos/${unit}`, {
    headers: {
      ...(config.projectId ? { project_id: config.projectId } : {}),
      "Content-Type": "application/json",
      "User-Agent": "open-djed",
    },
  }).then(async (res) => UTxOsByAddressWithUnitSchema.parse(await res.json()))

const CBORSchema = z.object({
  cbor: z.string(),
})

export const getDatumCBORByHash = (config: BlockfrostConfig, hash: string) =>
  fetch(`${config.url}/scripts/datum/${hash}/cbor`, {
    headers: {
      ...(config.projectId ? { project_id: config.projectId } : {}),
      "Content-Type": "application/json",
      "User-Agent": "open-djed",
    },
  }).then(async (res) => CBORSchema.parse(await res.json()).cbor)
