import { z } from "@hono/zod-openapi"

export const tokenSchema = z.enum(["DJED", "SHEN"]).openapi({ example: "DJED" })
export type TokenType = z.infer<typeof tokenSchema>

export const actionSchema = z
  .enum(["Mint", "Burn"])
  .openapi({ example: "Mint" })
export type ActionType = z.infer<typeof actionSchema>

export const periodSchema = z
  .enum(["D", "W", "M", "Y", "All", "d", "w", "m", "y", "all"])
  .openapi({ example: "D" })
export type PeriodType = z.infer<typeof periodSchema>
