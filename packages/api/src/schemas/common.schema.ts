import { z } from "zod"

export const tokenSchema = z.enum(["DJED", "SHEN"])
export type TokenType = z.infer<typeof tokenSchema>

export const actionSchema = z.enum(["Mint", "Burn"])
export type ActionType = z.infer<typeof actionSchema>

export const periodSchema = z.enum([
  "D",
  "W",
  "M",
  "Y",
  "All",
  "d",
  "w",
  "m",
  "y",
  "all",
])
export type PeriodType = z.infer<typeof periodSchema>
