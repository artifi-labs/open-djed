import type { ActionType, Token } from "@/types"

type ActionConfig = {
  pay: Token[]
  receive: Token[]
  payHasLeadingIcon: boolean
  receiveHasLeadingIcon: boolean
  payShowDual: boolean
  receiveShowDual: boolean
  isPayActive: boolean
  isReceiveActive: boolean
}

export const ACTION_CONFIG = {
  Mint: {
    pay: ["ADA"],
    receive: ["DJED", "SHEN"],
    payHasLeadingIcon: false,
    receiveHasLeadingIcon: true,
    payShowDual: false,
    receiveShowDual: false, // Change to true if you want to show dual values for Mint receive tokens
    isPayActive: false,
    isReceiveActive: false,
  },
  Burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: false, // Change to true if you want to show dual values for Burn pay tokens
    receiveShowDual: false,
    isPayActive: false,
    isReceiveActive: false,
  },
} satisfies Record<ActionType, ActionConfig>
