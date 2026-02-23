import z from "zod"

const TransactionUtxoAmountSchema = z.object({
  unit: z.string(),
  quantity: z.string(),
})

const TransactionBaseUtxoInputSchema = z.object({
  address: z.string(),
  amount: z.array(TransactionUtxoAmountSchema),
  output_index: z.number(),
  data_hash: z.string().nullable(),
  inline_datum: z.string().nullable(),
  reference_script_hash: z.string().nullable(),
  collateral: z.boolean(),
})

const TransactionUtxoInputSchema = TransactionBaseUtxoInputSchema.extend({
  tx_hash: z.string(),
  reference: z.boolean(),
})

const TransactionUtxoOutputSchema = TransactionBaseUtxoInputSchema.extend({
  consumed_by_tx: z.string().nullable(),
})

const TransactionUtxoSchema = z.object({
  hash: z.string(),
  inputs: z.array(TransactionUtxoInputSchema),
  outputs: z.array(TransactionUtxoOutputSchema),
})

export type TransactionUtxo = z.infer<typeof TransactionUtxoSchema>
export type TransactionUtxoOutput = z.infer<typeof TransactionUtxoOutputSchema>
export type TransactionUtxoInput = z.infer<typeof TransactionUtxoInputSchema>
export type TransactionUtxoAmount = z.infer<typeof TransactionUtxoAmountSchema>
export type TransactionUtxoResponse = TransactionUtxo

export type GetTransactionUTxOsParams = {
  hash: string
}