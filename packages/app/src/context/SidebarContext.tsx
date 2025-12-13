"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import { useWallet } from "@/context/WalletContext"
import WalletSidebar from "@/components/new-components/wallet/WalletSidebar"

type SidebarContextType = {
  isWalletSidebarOpen: boolean
  openWalletSidebar: () => void
  closeWalletSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { wallet, wallets, connect, disconnect, detectWallets } = useWallet()
  const [isWalletSidebarOpen, setIsWalletSidebarOpen] = useState(false)

  const openWalletSidebar = useCallback(() => setIsWalletSidebarOpen(true), [])
  const closeWalletSidebar = useCallback(
    () => setIsWalletSidebarOpen(false),
    [],
  )

  useEffect(() => {
    if (isWalletSidebarOpen && !wallet) detectWallets()
  }, [isWalletSidebarOpen, wallet, detectWallets])

  return (
    <SidebarContext.Provider
      value={{ isWalletSidebarOpen, openWalletSidebar, closeWalletSidebar }}
    >
      {children}

      <WalletSidebar
        wallet={wallet}
        wallets={wallets}
        connect={connect}
        disconnect={disconnect}
        isOpen={isWalletSidebarOpen}
        onClose={closeWalletSidebar}
      />
    </SidebarContext.Provider>
  )
}

export const useWalletSidebar = () => {
  const ctx = useContext(SidebarContext)
  if (!ctx)
    throw new Error(
      "useWalletSidebar must be used within a WalletSidebarProvider",
    )
  return ctx
}
