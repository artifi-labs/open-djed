import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "./routing"
import { fallbackLng } from "./settings"

function deepMerge(
  fallback: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...fallback }

  for (const key of Object.keys(override)) {
    const overrideVal = override[key]
    const fallbackVal = fallback[key]

    if (
      typeof overrideVal === 'object' &&
      overrideVal !== null &&
      typeof fallbackVal === 'object' &&
      fallbackVal !== null
    ) {
      result[key] = deepMerge(
        fallbackVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>
      )
    } else if (overrideVal !== '') {
      result[key] = overrideVal
    }
  }

  return result
}

function removeEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      acc[key] = removeEmptyStrings(value as Record<string, unknown>)
    } else if (value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, unknown>)
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const fallbackMessages = (await import(`../../messages/${fallbackLng}/translations.json`)).default
  const localeMessages = locale !== fallbackLng
    ? (await import(`../../messages/${locale}/translations.json`)).default
    : {}

  return {
    locale,
    messages: deepMerge(removeEmptyStrings(fallbackMessages), localeMessages),
    getMessageFallback({ key, namespace }) {
      return namespace ? `${namespace}.${key}` : key
    },
    onError() {}
  }
})