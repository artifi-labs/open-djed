import { IconCoinName } from "../Coin"

export type Type = "pay" | "receive"

export type ActionType = "mint" | "burn"

export const ACTION_CONFIG: Record<
  ActionType,
  {
    pay: IconCoinName[]
    receive: IconCoinName[]
    payHasLeadingIcon: boolean
    receiveHasLeadingIcon: boolean
    payShowDual: boolean
    receiveShowDual: boolean
  }
> = {
  mint: {
    pay: ["ADA"],
    receive: ["DJED", "SHEN"],
    payHasLeadingIcon: false,
    receiveHasLeadingIcon: true,
    payShowDual: false,
    receiveShowDual: true,
  },
  burn: {
    pay: ["DJED", "SHEN"],
    receive: ["ADA"],
    payHasLeadingIcon: true,
    receiveHasLeadingIcon: false,
    payShowDual: true,
    receiveShowDual: false,
  },
}
