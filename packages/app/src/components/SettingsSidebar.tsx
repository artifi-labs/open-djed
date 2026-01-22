import Dropdown from "./Dropdown"
import Sidebar from "./modals/Sidebar"
import { type ContextualMenuItem } from "./ContextualMenu"
import { env } from "@/lib/envLoader"
import { useViewport } from "@/hooks/useViewport"
// import { useEffect, useState } from "react"
// import { SUPPORTED_LANGUAGES } from "@/lib/constants"
// import { useTranslation } from "react-i18next"

export default function SettingsSidebar({
  isOpen,
  onClose,
  onBack,
}: {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
}) {
  // const { i18n } = useTranslation()
  const { NETWORK, CONFIG } = env
  const { isMobile } = useViewport()

  // const [activeLanguage, setActiveLanguage] = useState<string>("en")
  // const [_isClient, setIsClient] = useState(false)

  // useEffect(() => {
  //   setIsClient(true)
  //   setActiveLanguage(i18n.language)
  // }, [i18n.language])

  // const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => ({
  //   key: lang.code,
  //   text: lang.label,
  // }))

  // const handleLanguageChange = async (item: ContextualMenuItem) => {
  //   const newLang = item.key as string
  //   setActiveLanguage(newLang)
  //   await i18n.changeLanguage(newLang)
  // }

  // const currentLanguageItem = supportedLanguages.find(
  //   (lang) => lang.key === activeLanguage,
  // )

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
      title="Settings"
      titleClassName="text-[18px]"
      hasLeadingIcon={isMobile ? "Arrow-Left" : undefined}
      headerAction={null}
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
    >
      <div className="flex h-full w-full flex-col items-start justify-start gap-18 py-8">
        {/* <div className="flex w-full flex-col items-start justify-start gap-10">
          <span className="text-secondary text-xs">Language</span>
          <Dropdown
            text={currentLanguageItem?.text || "English"}
            size="medium"
            hasTag={false}
            menuItems={supportedLanguages}
            onChange={handleLanguageChange}
            trailingIcon="Chevron-down"
          />
        </div> */}

        <div className="flex w-full flex-col items-start justify-start gap-10">
          <span className="text-secondary text-xs">Network</span>
          <Dropdown
            text={currentNetworkItem?.text || "Select Network"}
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
