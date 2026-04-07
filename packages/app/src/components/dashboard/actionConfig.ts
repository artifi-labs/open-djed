import type { Token } from "@/lib/types/tokens"

export type Type = "pay" | "receive"

export type ActionType = "Mint" | "Burn" // TODO: MOVE THIS

export type ActionConfig = {
  pay: Token[]
  receive: Token[]
  payHasLeadingIcon: boolean
  receiveHasLeadingIcon: boolean
  payShowDual: boolean
  receiveShowDual: boolean
  isPayActive: boolean
  isReceiveActive: boolean
}

export const ACTION_CONFIG: Record<
  ActionType,
  ActionConfig
> = {
  Mint: {
    pay: ["ADA"],
    receive: ["DJED", "SHEN"],
    payHasLeadingIcon: false,
    receiveHasLeadingIcon: true,
    payShowDual: false,
    receiveShowDual: true,
    isPayActive: false,
    isReceiveActive: false,
  },
  Burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: true,
    receiveShowDual: false,
    isPayActive: false,
    isReceiveActive: false,
  },
}
