import type { Network } from "./types/network"

export type Token = "ADA" | "DJED" | "SHEN"

export type TokenClass = {
  tokenName: Token
  assetName: string
  assetId: string
  policyId: string
  policyIdAndEncodedName: string
}

type TokenNetworkData = Omit<TokenClass, "tokenName">

const TOKEN_DATA_BY_NETWORK: Record<Network, Record<Token, TokenNetworkData>> = {
  mainnet: {
    ADA: {
      assetName: "",
      assetId: "",
      policyId: "",
      policyIdAndEncodedName: "",
    },
    DJED: {
      assetName: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344",
      assetId: "asset15f3ymkjafxxeunv5gtdl54g5qs8ty9k84tq94x",
      policyId: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
      policyIdAndEncodedName: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344",
    },
    SHEN: {
      assetName: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd615368656e4d6963726f555344",
      assetId: "asset17v9z2sf7v05z6mne4qk0kzlmue5aqxtfxq8jyk",
      policyId: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
      policyIdAndEncodedName: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd615368656e4d6963726f555344",
    },
  },
  preprod: {
    ADA: {
      assetName: "",
      assetId: "",
      policyId: "",
      policyIdAndEncodedName: "",
    },
    DJED: {
      assetName: "...",
      assetId: "...",
      policyId: "...",
      policyIdAndEncodedName: "...",
    },
    SHEN: {
      assetName: "...",
      assetId: "...",
      policyId: "...",
      policyIdAndEncodedName: "...",
    },
  },
}

const TOKEN_KEYS: Token[] = ["ADA", "DJED", "SHEN"]

const buildNetworkTokens = (network: Network): Record<Token, TokenClass> => {
  const tokenData = TOKEN_DATA_BY_NETWORK[network]

  return TOKEN_KEYS.reduce((acc, tokenName) => {
    acc[tokenName] = {
      tokenName,
      ...tokenData[tokenName],
    }
    return acc
  }, {} as Record<Token, TokenClass>)
}

export const TOKENS: Record<Network, Record<Token, TokenClass>> = {
  mainnet: buildNetworkTokens("mainnet"),
  preprod: buildNetworkTokens("preprod"),
}