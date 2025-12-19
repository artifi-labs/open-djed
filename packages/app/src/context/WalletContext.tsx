"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { decode } from "cbor2"
import { z } from "zod"
import { useLocalStorage } from "usehooks-ts"
import { type Cardano } from "@lucid-evolution/lucid"
import { registryByNetwork } from "@open-djed/registry"
import { useEnv } from "./EnvContext"
import { useToast } from "./ToastContext"

export type WalletMetadata = {
  id: string
  name: string
  icon: string
}

export type Wallet = {
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
  name: string
}

type WalletContextType = {
  wallet: Wallet | null
  wallets: WalletMetadata[]
  connect: (id: string, showConnectNotification?: boolean) => Promise<void>
  detectWallets: () => void
  disconnect: () => void
}
const hexToAscii = (hex: string) => {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, "")
  if (clean.length % 2) throw new Error("Hex string requires even length")

  return (
    clean
      .match(/../g)
      ?.map((pair) => String.fromCharCode(parseInt(pair, 16)))
      .join("") || ""
  )
}
export function getCardanoFromWindowObject(): Cardano | null {
  if (typeof window === "undefined") {
    throw new Error("Cardano wallet not found in window object")
  }
  return window.cardano
}

const WalletContext = createContext<WalletContextType | null>(null)

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("WalletContext not found")
  return ctx
}

const uint8ArrayToHexString = (uint8Array: Uint8Array) =>
  Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const [connectedWalletId, setConnectedWalletId] = useLocalStorage<
    string | null
  >("connectedWalletId", null)

  const { network } = useEnv()

  const connect = useCallback(
    async (id: string, showConnectNotification = true) => {
      try {
        const cardano = getCardanoFromWindowObject()
        if (!cardano) return

        let api = await cardano[id].enable()
        let balanceStr: string = ""

        try {
          balanceStr = await api.getBalance()
        } catch (err: unknown) {
          if (typeof err !== "object" || err === null || !("code" in err))
            throw err

          if (err?.code === -4) {
            api = await cardano[id].enable()
            balanceStr = await api.getBalance()
          } else {
            throw err
          }
        }

        const decodedBalance = decode(balanceStr)
        const policyId = registryByNetwork[network].djedAssetId.slice(0, 56)
        const djedTokenName =
          registryByNetwork[network].djedAssetId.slice(56)
        const shenTokenName =
          registryByNetwork[network].shenAssetId.slice(56)
        const adaHandlePolicyId =
          "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"

        const parsedBalance = z
          .union([
            z.number(),
            z.tuple([
              z.number(),
              z.map(
                z.instanceof(Uint8Array).transform(uint8ArrayToHexString),
                z.map(
                  z.instanceof(Uint8Array).transform(uint8ArrayToHexString),
                  z.number(),
                ),
              ),
            ]),
          ])
          .transform((b) => {
            if (typeof b === "number") return { ADA: b / 1e6, DJED: 0, SHEN: 0 }
            const hexHandle = [
              ...(b[1].get(adaHandlePolicyId)?.keys() ?? []),
            ][0]

            return {
              ADA: b[0] / 1e6,
              DJED: (b[1].get(policyId)?.get(djedTokenName) ?? 0) / 1e6,
              SHEN: (b[1].get(policyId)?.get(shenTokenName) ?? 0) / 1e6,
              handle: hexHandle
                ? hexToAscii(hexHandle.replace(/^000de140/, ""))
                : undefined,
            }
          })
          .parse(decodedBalance)

        setConnectedWalletId(id)

        const getChangeAddress = async () => {
          const address = await api.getChangeAddress()
          return address
        }

        const getUsedAddresses = async () => {
          const addresses = await api.getUsedAddresses()
          return addresses
        }

        const walletAddress = await getChangeAddress().then(async (a) =>
          (
            await import("@dcspark/cardano-multiplatform-lib-browser")
          ).Address.from_hex(a).to_bech32(),
        )

        setWallet({
          name: cardano[id].name,
          icon: cardano[id].icon,
          balance: parsedBalance,
          address: walletAddress,
          utxos: () => api.getUtxos(),
          signTx: (txCbor: string) => api.signTx(txCbor, false),
          submitTx: api.submitTx,
          getChangeAddress,
          getUsedAddresses,
        })

        // Prevent showing notification on auto-reconnect
        if (showConnectNotification) {
          showToast({
            message: "Your wallet has been successfully connected.",
            type: "success",
          })
        }
      } catch (err) {
        console.error(`Failed to enable ${id}`, err)
        showToast({
          message: "Failed to connect your wallet.",
          type: "error",
        })
      }
    },
    [network, setConnectedWalletId, showToast],
  )

  useEffect(() => {
    ;(async () => {
      if (connectedWalletId) {
        try {
          await connect(connectedWalletId, false)
        } catch (err) {
          console.error("Failed to reconnect wallet:", err)
        }
      }
    })().catch((err) => {
      // This is just to satisfy the linter. Actual errors are caught inside already.
      console.error("Failed to reconnect wallet:", err)
    })
  }, [connect, connectedWalletId])

  const detectWallets = useCallback(() => {
    const cardano = getCardanoFromWindowObject()
    if (!cardano) return

    const detected = Object.keys(cardano)
      .filter((id) => cardano[id].icon)
      .map((id) => ({
        id,
        name: cardano[id].name,
        icon: cardano[id].icon,
      }))

    setWallets(detected)
  }, [setWallets])

  const disconnect = () => {
    setWallet(null)
    setConnectedWalletId(null)
    showToast({
      message: "Your wallet has been disconnected.",
      type: "error",
    })
  }

  return (
    <WalletContext.Provider
      value={{ wallet, wallets, connect, detectWallets, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}
