export const Token = {
  ADA: "ADA",
  DJED: "DJED",
  SHEN: "SHEN",
} as const

export type Token = (typeof Token)[keyof typeof Token]

export const SUPPORTED_TOKENS: Token[] = [Token.ADA, Token.DJED, Token.SHEN]
