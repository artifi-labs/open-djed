"use client"

import { capitalize } from "@/lib/utils"
import { Trans, useTranslation } from "react-i18next"

const Privacy = () => {
  const { t } = useTranslation()

  const month = capitalize(t("common.months.march"))
  const day = 11
  const year = 2025
  const effectiveDate = `${month} ${day}, ${year}`

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">{t("privacyPolicy.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("privacyPolicy.effectiveDate", { date: effectiveDate })}
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6 text-base leading-relaxed">
        <p>{t("privacyPolicy.intro")}</p>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.dataCollection")}
          </h2>
          <p>
            <Trans
              i18nKey="privacyPolicy.paragraphs.noPersonalData"
              components={{ strong: <strong /> }}
            />
          </p>
        </section>

        <section>
          <h3 className="mb-1 text-lg font-medium">
            {t("privacyPolicy.sections.wallets")}
          </h3>
          <p>{t("privacyPolicy.paragraphs.wallet")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.analytics")}
          </h2>
          <p>{t("privacyPolicy.paragraphs.analytics1")}</p>
          <p>
            <Trans
              i18nKey="privacyPolicy.paragraphs.analytics2"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>{t("privacyPolicy.paragraphs.analytics3")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.openSource")}
          </h2>
          <p>
            {t("privacyPolicy.paragraphs.openSource")}{" "}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              GNU General Public License v3.0
            </a>
            .
          </p>
          <p>
            {t("privacyPolicy.paragraphs.sourceCode")}{" "}
            <a
              href="https://github.com/artifi-labs/open-djed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              github.com/artifi-labs/open-djed
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.authentication")}
          </h2>
          <p>{t("privacyPolicy.paragraphs.authentication")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.policy")}
          </h2>
          <p> {t("privacyPolicy.paragraphs.policy")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacyPolicy.sections.contact")}
          </h2>
          <p>
            {t("privacyPolicy.paragraphs.contact")}{" "}
            <a
              href="https://discord.gg/MhYP7w8n8p"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Discord
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
export default Privacy
