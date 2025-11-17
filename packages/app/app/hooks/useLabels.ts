import { useTranslationMap } from '~/hooks/useTranslationMap'
import { ACTIONS } from '~/constants'

export function useActionLabels() {
  return useTranslationMap(ACTIONS, 'action')
}
