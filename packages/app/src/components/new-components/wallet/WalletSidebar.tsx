"use client"

import type { Wallet, WalletMetadata } from "@/context/WalletContext"
import Sidebar from "../modals/Sidebar"
import ConnectedWalletSection from "./ConnectedWalletSection"
import SelectWalletSection from "./SelectWalletSection"

export default function WalletSidebar({
  wallet,
  wallets,
  connect,
  disconnect,
  isOpen,
  onClose,
}: {
  wallet: Wallet | null
  wallets: WalletMetadata[]
  connect: (id: string) => Promise<void>
  disconnect: () => void
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Sidebar
      title={wallet ? "Wallet" : "Connect Wallet"}
      isOpen={isOpen}
      onClose={onClose}
    >
      {wallet ? (
        <ConnectedWalletSection wallet={wallet} disconnect={disconnect} />
      ) : wallets.length <= 0 ? (
        <span>No wallets detected</span>
      ) : (
        <SelectWalletSection wallets={wallets} onClick={connect} />
      )}
    </Sidebar>
  )
}
