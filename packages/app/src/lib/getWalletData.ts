import type { Wallet } from '@/context/WalletContext'

export async function getWalletData(wallet: Wallet) {
  const utxos = await wallet.utxos()
  if (!utxos) throw new Error('No UTXOs found')

  const address = await wallet.getChangeAddress()
  if (!address) throw new Error('Could not determine change address')

  return {
    utxos,
    address,
  }
}
