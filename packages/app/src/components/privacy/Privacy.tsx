"use client"

import { Trans, useTranslation } from "react-i18next"

const Privacy = () => {
  const { t } = useTranslation()

  const month = t("months.june")
  const day = 3
  const year = 2025
  const effectiveDate = `${month} ${day}, ${year}`

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">{t("privacy.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("privacy.effectiveDate", { date: effectiveDate })}
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6 text-base leading-relaxed">
        <p>{t("privacy.intro")}</p>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.dataCollection")}
          </h2>
          <p>
            <Trans
              i18nKey="privacy.paragraphs.noPersonalData"
              components={{ strong: <strong /> }}
            />
          </p>
        </section>

        <section>
          <h3 className="mb-1 text-lg font-medium">
            {t("privacy.sections.wallets")}
          </h3>
          <p>{t("privacy.paragraphs.wallet")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.cookies")}
          </h2>
          <p>
            <Trans
              i18nKey="privacy.paragraphs.cookies"
              components={{ strong: <strong /> }}
            />
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>{t("privacy.list.theme")}</li>
            <li>{t("privacy.list.network")}</li>
          </ul>
          <p>
            <Trans
              i18nKey="privacy.paragraphs.cookiesDetails"
              components={{ strong: <strong /> }}
            />
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.analytics")}
          </h2>
          <p>{t("privacy.paragraphs.analytics1")}</p>
          <p>
            <Trans
              i18nKey="privacy.paragraphs.analytics2"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>{t("privacy.paragraphs.analytics3")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.openSource")}
          </h2>
          <p>
            {t("privacy.paragraphs.openSource")}{" "}
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
            {t("privacy.paragraphs.sourceCode")}{" "}
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
            {t("privacy.sections.authentication")}
          </h2>
          <p>{t("privacy.paragraphs.authentication")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.policy")}
          </h2>
          <p> {t("privacy.paragraphs.policy")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("privacy.sections.contact")}
          </h2>
          <p>
            {t("privacy.paragraphs.contact")}{" "}
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
