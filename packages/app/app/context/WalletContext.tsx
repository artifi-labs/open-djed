import { createContext, useContext, useEffect, useState } from 'react'
import { decode } from 'cbor2'
import { useEnv } from './EnvContext'
import { z } from 'zod'
import { registryByNetwork } from '@open-djed/registry'
import { useLocalStorage } from 'usehooks-ts'
import Toast from '~/components/Toast'

type WalletMetadata = {
  id: string
  name: string
  icon: string
}

type Wallet = {
  signTx: (txCbor: string) => Promise<string>
  submitTx: (txCbor: string) => Promise<string>
  getChangeAddress: () => Promise<string>
  getUsedAddresses: () => Promise<string[]>
  address: string | null
  utxos: () => Promise<string[] | undefined>
  balance: {
    ADA: number
    DJED: number
    SHEN: number
    handle?: string
  }
  icon: string
}

type WalletContextType = {
  wallet: Wallet | null
  wallets: WalletMetadata[]
  connect: (id: string) => Promise<void>
  detectWallets: () => void
  disconnect: () => void
}
const hexToAscii = (hex: string) => {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, '')
  if (clean.length % 2) throw new Error('Hex string requires even length')

  return (
    clean
      .match(/../g)
      ?.map((pair) => String.fromCharCode(parseInt(pair, 16)))
      .join('') || ''
  )
}
const WalletContext = createContext<WalletContextType | null>(null)

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('WalletContext not found')
  return ctx
}

const networkIds = {
  Preprod: 0,
  Mainnet: 1,
} as const

const uint8ArrayToHexString = (uint8Array: Uint8Array) =>
  Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const [connectedWalletId, setConnectedWalletId] = useLocalStorage<string | null>('connectedWalletId', null)
  const [toastProps, setToastProps] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>(
    {
      message: '',
      type: 'success',
      show: false,
    },
  )
  const { network } = useEnv()

  useEffect(() => {
    ;(async () => {
      if (connectedWalletId) {
        try {
          await connect(connectedWalletId)
        } catch (err) {
          console.error('Failed to reconnect wallet:', err)
        }
      }
    })().catch((err) => {
      // This is just to satisfy the linter. Actual errors are caught inside already.
      console.error('Failed to reconnect wallet:', err)
    })
  }, [])

  const detectWallets = () => {
    if (typeof window === 'undefined') return

    const detected = Object.keys(window.cardano || {})
      .filter((id) => window.cardano[id].icon)
      .map((id) => {
        const prov = window.cardano[id]
        return {
          id,
          name: prov.name,
          icon: prov.icon,
        }
      })

    setWallets(detected)
  }

  const connect = async (id: string) => {
    try {
      const api = await window.cardano[id].enable()

      if ((await api.getNetworkId()) !== networkIds[network]) {
        setToastProps({ message: `Please connect to a ${network} wallet`, type: 'error', show: true })
        return
      }

      const balanceStr = await api.getBalance()
      const decodedBalance = decode(balanceStr)
      const parsedBalance = z
        .union([
          z.number(),
          z.tuple([
            z.number(),
            z.map(
              z.instanceof(Uint8Array).transform(uint8ArrayToHexString),
              z.map(z.instanceof(Uint8Array).transform(uint8ArrayToHexString), z.number()),
            ),
          ]),
        ])
        .transform((b) => {
          if (typeof b === 'number') return { ADA: b / 1e6, DJED: 0, SHEN: 0 }
          const policyId = registryByNetwork[network].djedAssetId.slice(0, 56)
          const djedTokenName = registryByNetwork[network].djedAssetId.slice(56)
          const shenTokenName = registryByNetwork[network].shenAssetId.slice(56)
          const adaHandlePolicyId = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a'
          const hexHandle = [...(b[1].get(adaHandlePolicyId)?.keys() ?? [])][0]

          return {
            ADA: b[0] / 1e6,
            DJED: (b[1].get(policyId)?.get(djedTokenName) ?? 0) / 1e6,
            SHEN: (b[1].get(policyId)?.get(shenTokenName) ?? 0) / 1e6,
            handle: hexHandle ? hexToAscii(hexHandle.replace(/^000de140/, '')) : undefined,
          }
        })
        .parse(decodedBalance)
      setConnectedWalletId(id)
      const getChangeAddress = async () => {
        const address = await api.getChangeAddress()
        return address
      }
      const getUsedAddresses = async () => {
        const oldAddresses = await api.getUsedAddresses()
        return oldAddresses
      }
      setWallet({
        icon: window.cardano[id].icon,
        balance: parsedBalance,
        address: await getChangeAddress().then(async (a) =>
          (await import('@dcspark/cardano-multiplatform-lib-browser')).Address.from_hex(a).to_bech32(),
        ),
        utxos: () => api.getUtxos(),
        signTx: (txCbor: string) => api.signTx(txCbor, false),
        submitTx: api.submitTx,
        getChangeAddress,
        getUsedAddresses,
      })
    } catch (err) {
      console.error(`Failed to enable ${id}`, err)
    }
  }

  const disconnect = () => {
    setWallet(null)
    setConnectedWalletId(null)
  }

  return (
    <WalletContext.Provider value={{ wallet, wallets, connect, detectWallets, disconnect }}>
      {children}
      <Toast
        message={toastProps.message}
        show={toastProps.show}
        onClose={() => setToastProps({ ...toastProps, show: false })}
        type={toastProps.type}
      />
    </WalletContext.Provider>
  )
}
