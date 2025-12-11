import { useTranslation } from 'react-i18next'
import type { ActionType } from '@open-djed/api'

export function useActionLabels(): Record<ActionType, string> {
  const { t } = useTranslation()

  return {
    Mint: t('action.mint'),
    Burn: t('action.burn'),
  }
}
