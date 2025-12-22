import Dropdown from "./Dropdown"
import Sidebar from "./modals/Sidebar"
import { useEnv } from "@/context/EnvContext"
import { type ContextualMenuItem } from "./ContextualMenu"

export default function SettingsSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  //const { i18n } = useTranslation()
  const { network, config } = useEnv()

  //const [activeLanguage, setActiveLanguage] = useState<string>("en")
  //const [_isClient, setIsClient] = useState(false)

  /*useEffect(() => {
    setIsClient(true)
    setActiveLanguage(i18n.language)
  }, [i18n.language])

  const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang.code,
    text: lang.label,
  }))

  const handleLanguageChange = async (item: ContextualMenuItem) => {
    const newLang = item.key as string
    setActiveLanguage(newLang)
    await i18n.changeLanguage(newLang)
  }

  const currentLanguageItem = supportedLanguages.find(
    (lang) => lang.key === activeLanguage,
  )
*/
  const networkItems = Object.keys(config).map((key) => ({
    key: key,
    text: key.charAt(0).toUpperCase() + key.slice(1),
  }))

  const handleNetworkChange = (item: ContextualMenuItem) => {
    const selectedNetwork = item.key as string
    if (config[selectedNetwork]) {
      window.location.href = config[selectedNetwork]
    }
  }

  const currentNetworkItem = networkItems.find((item) => item.key === network)

  return (
    <Sidebar title="Settings" isOpen={isOpen} onClose={onClose}>
      <div className="flex h-full w-full flex-col items-start justify-start gap-22 px-24 py-8">
        {/* <div className="flex w-full flex-col items-start justify-start gap-8">
          <span className="text-secondary text-xs">Language</span>
          <Dropdown
            text={currentLanguageItem?.text || "English"}
            size="large"
            hasTag={false}
            menuItems={supportedLanguages}
            onChange={handleLanguageChange}
            trailingIcon="Chevron-down"
          />
        </div> */}

        <div className="flex w-full flex-col items-start justify-start gap-8">
          <span className="text-secondary text-xs">Network</span>
          <Dropdown
            text={currentNetworkItem?.text || "Select Network"}
            size="large"
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
