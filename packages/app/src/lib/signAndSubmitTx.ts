/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Wallet } from '@/context/WalletContext'

export async function signAndSubmitTx(
  wallet: Wallet,
  txCbor: string,
  Transaction: any,
  TransactionWitnessSet: any,
) {
  console.log('Unsigned transaction CBOR: ', txCbor)
  const signature = await wallet.signTx(txCbor)
  console.log('Signature: ', signature)
  const tx = Transaction.from_cbor_hex(txCbor)
  const body = tx.body()
  const witnessSet = tx.witness_set()
  witnessSet.add_all_witnesses(TransactionWitnessSet.from_cbor_hex(signature))
  const signedTxCbor = Transaction.new(body, witnessSet, true).to_cbor_hex()
  console.log('Signed transaction CBOR: ', signedTxCbor)
  const txHash = await wallet.submitTx(signedTxCbor)
  console.log('Transaction hash:', txHash)
  return txHash
}
