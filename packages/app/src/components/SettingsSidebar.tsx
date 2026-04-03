"use client"
import Dropdown from "./Dropdown"
import Sidebar from "./modals/Sidebar"
import { type ContextualMenuItem } from "./ContextualMenu"
import { env } from "@/lib/envLoader"
import { useViewport } from "@/hooks/useViewport"
import { capitalize } from "@/lib/utils"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

export default function SettingsSidebar({
  isOpen,
  onClose,
  onBack,
}: {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()

  const { NETWORK, CONFIG } = env
  const { isMobile } = useViewport()

  const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang.code,
    text: lang.label,
  }))

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return

    const query = Object.fromEntries(searchParams.entries())

    router.replace(
      Object.keys(query).length > 0 ? { pathname, query } : pathname,
      { locale: newLocale },
    )
  }

  const handleLanguageChange = (item: ContextualMenuItem) => {
    const newLang = item.key as string
    switchLocale(newLang)
  }

  const currentLanguageItem = supportedLanguages.find(
    (lang) => lang.key === locale,
  )

  const networkItems = Object.keys(CONFIG).map((key) => ({
    key: key,
    text: key.charAt(0).toUpperCase() + key.slice(1),
  }))

  const handleNetworkChange = (item: ContextualMenuItem) => {
    const selectedNetwork = item.key as string
    if (CONFIG[selectedNetwork as keyof typeof CONFIG]) {
      window.location.href = CONFIG[selectedNetwork as keyof typeof CONFIG]
    }
  }

  const currentNetworkItem = networkItems.find((item) => item.key === NETWORK)

  return (
    <Sidebar
      title={capitalize(t("settings.title"))}
      headerClassName="pl-16 pr-6 py-12 desktop:px-24"
      hasLeadingIcon={isMobile ? "Arrow-Left" : undefined}
      headerAction={null}
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      paddingClassName="px-16 py-8 desktop:px-24"
    >
      <div className="flex h-full w-full flex-col items-start justify-start gap-18">
        <div className="flex w-full flex-col items-start justify-start gap-10">
          <span className="text-secondary text-xs">
            {t("settings.language.title")}
          </span>
          <Dropdown
            text={currentLanguageItem?.text || t("common.select")}
            size="medium"
            hasTag={false}
            menuItems={supportedLanguages}
            onChange={handleLanguageChange}
            trailingIcon="Chevron-down"
          />
        </div>

        <div className="flex w-full flex-col items-start justify-start gap-10">
          <span className="text-secondary text-xs">
            {t("settings.network.title")}
          </span>
          <Dropdown
            text={currentNetworkItem?.text || t("common.select")}
            size="medium"
            hasTag={false}
            menuItems={networkItems}
            onChange={handleNetworkChange}
            trailingIcon="Chevron-down"
          />
        </div>
      </div>
    </Sidebar>
  )
}
