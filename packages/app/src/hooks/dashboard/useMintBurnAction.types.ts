import type { InputStatus } from "../../components/input-fields/TransactionInput"
import type { Token } from "@/types"
import type { ActionType } from "@/types"

export type ReserveBoundsType = "below" | "above" | "in-bounds"

export type TokenActionState = {
  token: Token
  value: number
  min: number
  max: number
  available: number | undefined
  disabled: boolean
  status: InputStatus
  suffix: string
  message?: {
    message?: string
  }
  onChange: (value: number) => void
  onTokenChange: () => void
  onHalfClick: () => void
  onMaxClick: () => void
}

export type DualSectionState = {
  isDualSelected: boolean
  isLinkSelected: boolean
}

export type DualStateByType = Record<"pay" | "receive", DualSectionState>

export type SelectedTokensByType = Record<"pay" | "receive", Token[]>

export type SectionDualState = {
  text: string
  disabled: boolean
  isDualSelected: boolean
  isLinkSelected: boolean
  onDualChange: () => void
  onLinkChange: () => void
}

export type TokenActionStateConfig = {
  dual: SectionDualState
  tokens: Token[]
  activeTokens: Token[]
  inputs: TokenActionState[]
}

export type TokenActionStateMap = {
  action: ActionType
  pay: TokenActionStateConfig
  receive: TokenActionStateConfig
}

export type ButtonState = {
  text: string
  disabled: boolean
  onClick?: () => Promise<void>
}
