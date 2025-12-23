"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import { useWallet } from "@/context/WalletContext"
import WalletSidebar from "@/components/wallet/WalletSidebar"
import SettingsSidebar from "@/components/SettingsSidebar"

type SidebarType = "wallet" | "settings" | null

type SidebarContextType = {
  activeSidebar: SidebarType
  isWalletSidebarOpen: boolean
  isSettingsSidebarOpen: boolean
  openWalletSidebar: () => void
  openSettingsSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { wallet, wallets, connect, disconnect, detectWallets } = useWallet()
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>(null)

  const openWalletSidebar = useCallback(() => setActiveSidebar("wallet"), [])

  const openSettingsSidebar = useCallback(
    () => setActiveSidebar("settings"),
    [],
  )

  const closeSidebar = useCallback(() => setActiveSidebar(null), [])

  const isWalletSidebarOpen = activeSidebar === "wallet"
  const isSettingsSidebarOpen = activeSidebar === "settings"

  useEffect(() => {
    if (isWalletSidebarOpen && !wallet) detectWallets()
  }, [isWalletSidebarOpen, wallet, detectWallets])

  return (
    <SidebarContext.Provider
      value={{
        activeSidebar,
        isWalletSidebarOpen,
        isSettingsSidebarOpen,
        openWalletSidebar,
        openSettingsSidebar,
        closeSidebar,
      }}
    >
      {children}

      <WalletSidebar
        wallet={wallet}
        wallets={wallets}
        connect={(wallet) => {
          connect(wallet).catch(console.error)
        }}
        disconnect={disconnect}
        isOpen={isWalletSidebarOpen}
        onClose={closeSidebar}
      />

      <SettingsSidebar isOpen={isSettingsSidebarOpen} onClose={closeSidebar} />
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}
