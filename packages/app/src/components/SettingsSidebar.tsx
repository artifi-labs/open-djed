import Dropdown from "./Dropdown"
import Sidebar from "./modals/Sidebar"
import { type ContextualMenuItem } from "./ContextualMenu"
import { env } from "@/lib/envLoader"
import { useViewport } from "@/hooks/useViewport"
import { useTranslation } from "react-i18next"
import { capitalize } from "@/lib/utils"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"

export default function SettingsSidebar({
  isOpen,
  onClose,
  onBack,
}: {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
}) {
  const { t, i18n } = useTranslation()
  const { NETWORK, CONFIG } = env
  const { isMobile } = useViewport()

  const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang.code,
    text: lang.label,
  }))

  const activeLanguage = i18n.language

  const handleLanguageChange = (item: ContextualMenuItem) => {
    const newLang = item.key as string
    i18n.changeLanguage(newLang).catch((err) => {
      console.error("Failed to change language:", err)
    })
  }

  const currentLanguageItem = supportedLanguages.find(
    (lang) => lang.key === activeLanguage,
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
          <span className="text-secondary text-xs">Language</span>
          <Dropdown
            text={currentLanguageItem?.text || "English"}
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
            text={currentNetworkItem?.text || t("settings.network.select")}
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
