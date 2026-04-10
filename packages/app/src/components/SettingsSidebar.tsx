"use client"

import Dropdown from "./Dropdown"
import Sidebar from "./modals/Sidebar"
import { useViewport } from "@/hooks/shared/useViewport"
import { capitalize } from "@/utils"
import { useTranslations } from "next-intl"
import { useSettings } from "@/hooks/shared/useSettings"
import type { Setting } from "@/types"

function SettingField({ setting }: { setting: Setting }) {
  switch (setting.type) {
    case "dropdown":
      return (
        <Dropdown
          size="medium"
          hasTag={false}
          menuItems={setting.items}
          defaultItem={setting.current}
          onChange={(item) => setting.onChange(item.key as string)}
          trailingIcon="Chevron-down"
        />
      )
    default:
      return null
  }
}

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
  const { isMobile } = useViewport()
  const settings = useSettings()

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
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex w-full flex-col items-start justify-start gap-10"
          >
            <span className="text-secondary text-xs">{setting.label}</span>
            <SettingField setting={setting} />
          </div>
        ))}
      </div>
    </Sidebar>
  )
}
