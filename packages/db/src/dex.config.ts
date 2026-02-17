import type { Dex, DexConfig } from "./types/dex";
import type { Network } from "./types/network";

export const DEX_CONFIG: Record<Network, Record<Dex, DexConfig>> = {
  mainnet: {
    minswap: {
      displayName: "MinSwap",
      pollId: 'pool1ases3nklh6gyjf74r7dqm89exjfd520z9cefqru959wcccmrdlk',
      address: "addr1z84q0denmyep98ph3tmzwsmw0j7zau9ljmsqx6a4rvaau66j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq777e2a",
    },
    wingriders: {
      displayName: "WingRiders",
      pollId: '456',
      address: 'addr1...'
    }
  },
  preprod: {
    minswap: {
      displayName: "MinSwap Testnet",
      pollId: 'pool13m26ky08vz205232k20u8ft5nrg8u68klhn0xfsk9m4gsqsc44v',
      address: 'addr1z84q0denmyep98ph3tmzwsmw0j7zau9ljmsqx6a4rvaau66j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq777e2a'
    },
    wingriders: {
      displayName: "WingRiders Testnet",
      pollId: 'def',
      address: 'addr_test1...'
    }
  }
} as const

