import React from "react"
import { Trans, useTranslation } from "react-i18next"

const OpenDjedContent = () => {
  const { t } = useTranslation()

  const WHY_OPEN_DJED_KEYS = [
    "protocolCompatible",
    "openSource",
    "communityFirst",
    "reliable",
    "globalAccess",
    "transparentFees",
  ] as const

  return (
    <div className="text-secondary flex flex-col gap-16 text-sm">
      {/* What is Open Djed? */}
      <p className="text-sm">{t("dashboard.whatIsOpenDjed.description")}</p>

      {/* Why Open Djed? */}
      <div className="flex flex-col gap-12">
        <h3 className="text-primary text-xl font-medium">
          {t("dashboard.whatIsOpenDjed.whyOpenDjed.title")}
        </h3>
        <ul className="ml-3 flex list-disc flex-col pl-3">
          {WHY_OPEN_DJED_KEYS.map((key) => (
            <li key={key}>
              <Trans
                i18nKey={`dashboard.whatIsOpenDjed.whyOpenDjed.items.${key}`}
                components={{ strong: <strong /> }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default OpenDjedContent
