"use client"
import React, { useState } from "react"
import { ClientProvider } from "@/context/ApiClientContext"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { WalletProvider } from "@/context/WalletContext"
import { SidebarProvider } from "@/context/SidebarContext"
import { ToastProvider } from "@/context/ToastContext"
import { env } from "@/lib/envLoader"
import { captureEvent } from "@/lib/analytics"

export interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {},
        queryCache: new QueryCache({
          onError: (error, query) => {
            captureEvent("query_failed", {
              query: String(query.queryKey[0]),
              message: error instanceof Error ? error.message : String(error),
            })
          },
        }),
      }),
  )

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
