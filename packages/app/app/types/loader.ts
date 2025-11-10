import type { Network } from '@open-djed/registry'

export type LoaderData = {
  apiUrl: string
  network: Network
  config: Record<string, string>
  initialIsDark: 'dark' | 'light' | null
  posthog: {
    url: string
    key: string
  }
}
