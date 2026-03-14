import { useTranslations } from "next-intl"
import React from "react"

const OpenDjedContent = () => {
  const t = useTranslations()

  const WHY_OPEN_DJED_KEYS = [
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.protocolCompatible"),
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.openSource"),
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.communityFirst"),
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.reliable"),
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.globalAccess"),
    t("dashboard.whatIsOpenDjed.whyOpenDjed.items.transparentFees"),
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
          {WHY_OPEN_DJED_KEYS.map((key, index) => (
            <li key={index}>
              {t.rich(key, {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default OpenDjedContent
