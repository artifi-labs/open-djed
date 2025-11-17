import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * A generic hook to generate a map of translated labels for a given set of keys.
 *
 * This hook is useful for enums or union literal types where each key needs
 * a corresponding i18n translation.
 *
 * @template T - The type of the keys (usually a union literal type)
 * @param {T[]} keys - Array of keys to generate translations for
 * @param {string} i18nPrefix - Prefix for i18n keys (e.g., 'action', 'token')
 * @returns {Record<T, string>} - A map from each key to its translated label
 *
 * @example
 * const ACTION_KEYS = ['Mint', 'Burn'] as const;
 * const actionLabels = useTranslationMap(ACTION_KEYS, 'action');
 * console.log(actionLabels.Mint); // translated label for 'action.mint'
 */
export function useTranslationMap<T extends string>(keys: T[], i18nPrefix: string): Record<T, string> {
  const { t, i18n } = useTranslation()

  return useMemo(() => {
    const map: Partial<Record<T, string>> = {}
    keys.forEach((key) => {
      map[key] = t(`${i18nPrefix}.${key.toLowerCase()}`)
    })
    return map as Record<T, string>
  }, [i18n.language, keys, i18nPrefix, t])
}
