import type { ActionType } from "@/types"
import type { ActionConfig } from "./actionConfig.types"

export const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
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
