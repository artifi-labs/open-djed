"use client"

import React, { useState } from "react"
import { ThemeProvider } from "@/context/ThemeContext"
import { ClientProvider } from "@/context/ApiClientContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EnvProvider } from "@/context/EnvContext"
import { WalletProvider } from "@/context/WalletContext"
import { I18nProvider } from "@/context/I18nProvider"
import { SidebarProvider } from "@/context/SidebarContext"

export interface ProvidersProps {
  children: React.ReactNode
  apiUrl: string
  network: "Preprod" | "Mainnet"
  config: Record<string, string>
  posthog?: string
}

export const Providers = ({
  children,
  apiUrl,
  network,
  config,
  posthog,
}: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <EnvProvider env={{ apiUrl, network, config, posthog }}>
      <WalletProvider>
        <SidebarProvider>
          <ThemeProvider>
            <ClientProvider apiUrl={apiUrl}>
              <QueryClientProvider client={queryClient}>
                <I18nProvider>{children}</I18nProvider>
              </QueryClientProvider>
            </ClientProvider>
          </ThemeProvider>
        </SidebarProvider>
      </WalletProvider>
    </EnvProvider>
  )
}
