import { SUPPORTED_LANGUAGES } from "@/lib/constants"
import { env } from "@/lib/envLoader"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useMemo } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import type { Network, Setting } from "@/lib/types"

export function useSettings(): Setting[] {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { NETWORK, CONFIG } = env
  const t = useTranslations()

  // Settings Options
  const languageItems = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((lang) => ({ key: lang.code, text: lang.label })),
    [],
  )

  const networkItems = useMemo(
    () =>
      Object.keys(CONFIG).map((key) => ({
        key: key as Network,
        text: key.charAt(0).toUpperCase() + key.slice(1),
      })),
    [CONFIG],
  )

  // Current Settings
  const currentLanguage = useMemo(
    () => languageItems.find((lang) => lang.key === locale),
    [languageItems, locale],
  )

  const currentNetwork = useMemo(
    () => networkItems.find((item) => item.key === NETWORK),
    [networkItems, NETWORK],
  )

  // Change Functions
  const changeLocale = useCallback(
    (newLocale: string) => {
      router.replace(
        { pathname, query: Object.fromEntries(searchParams.entries()) },
        { locale: newLocale },
      )
    },
    [pathname, router, searchParams],
  )

  const changeNetwork = useCallback(
    (network: string) => {
      if (network in CONFIG) {
        window.location.href = CONFIG[network as Network]
      }
    },
    [CONFIG],
  )

  return useMemo(
    () => [
      {
        type: "dropdown",
        key: "language",
        label: t("settings.language.title"),
        items: languageItems,
        current: currentLanguage,
        onChange: changeLocale,
      },
      {
        type: "dropdown",
        key: "network",
        label: t("settings.network.title"),
        items: networkItems,
        current: currentNetwork,
        onChange: changeNetwork,
      },
    ],
    [
      t,
      languageItems,
      networkItems,
      locale,
      NETWORK,
      CONFIG,
      changeLocale,
      changeNetwork,
    ],
  )
}
