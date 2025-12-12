import type { Env } from '@/context/EnvContext'

export function getLoaderData(): Env {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const NETWORK = process.env.NEXT_PUBLIC_NETWORK as 'Preprod' | 'Mainnet' | undefined
  const CONFIG = process.env.NEXT_PUBLIC_CONFIG
  // const POSTHOG = process.env.NEXT_PUBLIC_POSTHOG_API_KEY

  if (!API_URL || !NETWORK || !CONFIG) {
    throw new Error('Missing environment variables')
  }

  return {
    apiUrl: API_URL,
    network: NETWORK,
    config: JSON.parse(CONFIG),
  }
}
