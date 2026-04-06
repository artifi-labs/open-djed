import { z } from "zod"

const transactionUtxoAmountSchema = z.object({
  unit: z.string(),
  quantity: z.string(),
})

const transactionBaseUtxoSchema = z.object({
  address: z.string(),
  amount: z.array(transactionUtxoAmountSchema),
  output_index: z.number(),
  data_hash: z.string().nullable(),
  inline_datum: z.string().nullable(),
  reference_script_hash: z.string().nullable(),
  collateral: z.boolean(),
})

const transactionUtxoInputSchema = transactionBaseUtxoSchema.extend({
  tx_hash: z.string(),
  reference: z.boolean(),
})

const transactionUtxoOutputSchema = transactionBaseUtxoSchema.extend({
  consumed_by_tx: z.string().nullable(),
})

export const transactionUtxoSchema = z.object({
  hash: z.string(),
  inputs: z.array(transactionUtxoInputSchema),
  outputs: z.array(transactionUtxoOutputSchema),
})

export type TransactionUtxoAmount = z.infer<typeof transactionUtxoAmountSchema>
export type TransactionUtxoInput = z.infer<typeof transactionUtxoInputSchema>
export type TransactionUtxoOutput = z.infer<typeof transactionUtxoOutputSchema>
export type TransactionUtxo = z.infer<typeof transactionUtxoSchema>
