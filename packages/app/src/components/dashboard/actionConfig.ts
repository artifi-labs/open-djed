import type { Token } from "@/lib/tokens"

export type Type = "pay" | "receive"

export type ActionType = "Mint" | "Burn"

export const ACTION_CONFIG: Record<
  ActionType,
  {
    pay: Token[]
    receive: Token[]
    payHasLeadingIcon: boolean
    receiveHasLeadingIcon: boolean
    payShowDual: boolean
    receiveShowDual: boolean
  }
> = {
  Mint: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: false,
    receiveShowDual: false, // TODO: change to true when dual values are available for Mint
  },
  Burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: false, // TODO: change to true when dual values are available for Burn
    receiveShowDual: false,
  },
}
