export type Transaction = {
  tx_hash: string
  tx_index: number
  block_height: number
  block_time: number
}

export type Amount = {
  quantity: string
  unit: string
}

export type Input = {
  address: string
  amount: Amount[]
  collateral: boolean
  data_hash: string | null
  inline_datum: string | null
  output_index: number
  reference_script_hash: string | null
  tx_hash: string
  reference?: boolean
}

export type Output = {
  address: string
  amount: Amount[]
  collateral: boolean
  data_hash: string | null
  inline_datum: string | null
  output_index: number
  reference_script_hash: string | null
  consumed_by_tx?: string
}

export type UTxO = {
  hash: string
  inputs: Input[]
  outputs: Output[]
}
