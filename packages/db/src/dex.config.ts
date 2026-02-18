import type { Network } from "./types/network"

export type DexNetworkConfig = {
  address: string
};

export type DexConfigEntry = {
  displayName: string
} & Record<Network, DexNetworkConfig>;

export const DEX_CONFIG = {
  minswap: {
    displayName: "MinSwap",
    mainnet: {
      address: 'addr1z84q0denmyep98ph3tmzwsmw0j7zau9ljmsqx6a4rvaau66j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq777e2a'
    },
    preprod: {
      address: '...'
    }
  },
  wingriders: {
    displayName: "WingRiders",
    mainnet: {
      address: 'addr1zxhew7fmsup08qvhdnkg8ccra88pw7q5trrncja3dlszhq6d77rk0jjxny493quf2pv32xup2ucx6hp6enfjg8gnjq0qqzlqam'
    },
    preprod: {
      address: '...'
    }
  }
} satisfies Record<string, DexConfigEntry>;

export type DexKey = keyof typeof DEX_CONFIG

