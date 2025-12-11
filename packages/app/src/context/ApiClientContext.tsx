'use client'
import { createContext, useContext } from 'react'
import { hc } from 'hono/client'
import { type AppType } from '@open-djed/api'

const ClientContext = createContext<ReturnType<typeof hc<AppType>> | null>(null)

export function ClientProvider({ children, apiUrl }: { children: React.ReactNode; apiUrl: string }) {
  const client = hc<AppType>(apiUrl)
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
}

export function useApiClient() {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('ClientContext not found')
  return ctx
}
