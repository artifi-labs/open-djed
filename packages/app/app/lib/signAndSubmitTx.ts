/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppType } from '@open-djed/api'
import { AppError } from '@open-djed/api/src/errors'
import type { hc } from 'hono/client'
import type { Wallet } from '~/context/WalletContext'

export async function signAndSubmitTx(
  apiClient: ReturnType<typeof hc<AppType>> | null,
  wallet: Wallet,
  txCbor: string,
  Transaction: any,
  TransactionWitnessSet: any,
) {
  if (!apiClient) throw new AppError('API client is null.')
  console.log('Unsigned transaction CBOR: ', txCbor)

  const signature = await wallet.signTx(txCbor)
  console.log('Signature: ', signature)

  const tx = Transaction.from_cbor_hex(txCbor)
  const body = tx.body()
  const witnessSet = tx.witness_set()
  witnessSet.add_all_witnesses(TransactionWitnessSet.from_cbor_hex(signature))

  const signedTxCbor = Transaction.new(body, witnessSet, true).to_cbor_hex()
  console.log('Signed transaction CBOR: ', signedTxCbor)

  const txRes = await apiClient.api['submit-tx'].$post({
    json: { txCbor: signedTxCbor },
  })

  if (!txRes.ok) {
    let errorMessage = `Request failed with status ${txRes.status}`

    try {
      const errorBody = (await txRes.json()) as { message?: string; error?: string }
      errorMessage = errorBody?.message || errorBody?.error || errorMessage
    } catch {
      const text = await txRes.text()
      if (text) errorMessage = text
    }

    throw new AppError(errorMessage)
  }

  const txHash = await txRes.text()
  if (!txHash) throw new AppError('Transaction submitted, but no hash was returned.')
  return txHash
}
