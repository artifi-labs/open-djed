"use client"

import React, { useState } from "react"
import { ClientProvider } from "@/context/ApiClientContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletProvider } from "@/context/WalletContext"
import { SidebarProvider } from "@/context/SidebarContext"
import { ToastProvider } from "@/context/ToastContext"
import { env } from "@/lib/envLoader"

export interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClientProvider apiUrl={env.API_URL}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WalletProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </WalletProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ClientProvider>
  )
}
