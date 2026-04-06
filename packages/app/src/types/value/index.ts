import type { TokenType } from "@open-djed/api"

export type ADAValue = { ADA: number }

export type Value = Partial<Record<"ADA" | TokenType, number>>

export type ToUSDConverter = (value: Value, price: number) => string
