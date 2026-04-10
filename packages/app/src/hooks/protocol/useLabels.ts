import { useTranslations } from "next-intl"
import type { ActionType } from "@open-djed/api"

export function useActionLabels(): Record<ActionType, string> {
  const t = useTranslations()

  return {
    Mint: t("action.mint"),
    Burn: t("action.burn"),
  }
}
