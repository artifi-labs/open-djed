import { Token } from "@/lib/tokens"

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
    pay: ["ADA"],
    receive: ["DJED", "SHEN"],
    payHasLeadingIcon: false,
    receiveHasLeadingIcon: true,
    payShowDual: false,
    receiveShowDual: true,
  },
  Burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: true,
    receiveShowDual: false,
  },
}
