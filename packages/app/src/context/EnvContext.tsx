'use client'

import React, { createContext, useContext } from 'react'

export type Env = {
  apiUrl: string
  network: 'Preprod' | 'Mainnet'
  config: Record<string, string>
  posthog: string
}

const EnvContext = createContext<Env | undefined>(undefined)

export const EnvProvider = ({ env, children }: { env: Env; children: React.ReactNode }) => {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>
}

export const useEnv = (): Env => {
  const context = useContext(EnvContext)
  if (!context) throw new Error('useEnv must be used within an EnvProvider')
  return context
}
