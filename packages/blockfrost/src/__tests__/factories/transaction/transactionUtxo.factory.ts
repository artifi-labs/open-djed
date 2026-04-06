import type {
  TransactionUtxo,
  TransactionUtxoInput,
  TransactionUtxoOutput,
} from "../../../src/schemas/transaction/transactionUtxo.schema"
import { createFactory } from "../createFactory"

const createTransactionUtxoInput = createFactory<TransactionUtxoInput>({
  address:
    "addr1q9ld26v2lv8wvrxxmvg90pn8n8n5k6tdst06q2s856rwmvnueldzuuqmnsye359fqrk8hwvenjnqultn7djtrlft7jnq7dy7wv",
  amount: [{ unit: "lovelace", quantity: "42000000" }],
  output_index: 0,
  data_hash: null,
  inline_datum: null,
  reference_script_hash: null,
  collateral: false,
  tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  reference: false,
})

const createTransactionUtxoOutput = createFactory<TransactionUtxoOutput>({
  address:
    "addr1q9ld26v2lv8wvrxxmvg90pn8n8n5k6tdst06q2s856rwmvnueldzuuqmnsye359fqrk8hwvenjnqultn7djtrlft7jnq7dy7wv",
  amount: [{ unit: "lovelace", quantity: "42000000" }],
  output_index: 0,
  data_hash: null,
  inline_datum: null,
  reference_script_hash: null,
  collateral: false,
  consumed_by_tx: null,
})

export const createTransactionUtxo = createFactory<TransactionUtxo>({
  hash: "1e043f100dce12d107f679685acd2fc0610e10f72a92d412794c9773d11d8477",
  inputs: [createTransactionUtxoInput()],
  outputs: [createTransactionUtxoOutput()],
})

export { createTransactionUtxoInput, createTransactionUtxoOutput }
