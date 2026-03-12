"use client"

import type { Wallet, WalletMetadata } from "@/context/WalletContext"
import Sidebar from "../modals/Sidebar"
import ConnectedWalletSection from "./ConnectedWalletSection"
import SelectWalletSection from "./SelectWalletSection"
import { useTranslations } from "next-intl"

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
  connect: (id: string) => void
  disconnect: () => void
  isOpen: boolean
  onClose: () => void
}) {
  const t = useTranslations()
  return (
    <Sidebar
      title={wallet ? t("wallet.title") : t("wallet.connectWallet")}
      isOpen={isOpen}
      onClose={onClose}
      paddingClassName="p-0"
      headerClassName="pl-16 pr-6 py-12 desktop:px-24"
    >
      {wallet ? (
        <ConnectedWalletSection wallet={wallet} disconnect={disconnect} />
      ) : wallets.length <= 0 ? (
        <span>{t("wallet.noWalletsDetected")}</span>
      ) : (
        <SelectWalletSection wallets={wallets} onClick={connect} />
      )}
    </Sidebar>
  )
}
