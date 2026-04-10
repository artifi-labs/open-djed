export const ActionSection = {
  PAY: "pay",
  RECEIVE: "receive",
} as const

export type ActionSection = (typeof ActionSection)[keyof typeof ActionSection]

export const ActionType = {
  MINT: "Mint",
  BURN: "Burn",
} as const

export type ActionType = (typeof ActionType)[keyof typeof ActionType]
