"use client"
import { useTranslations } from "next-intl"

const Term = () => {
  const t = useTranslations()

  const month = t("common.months.may")
  const day = 15
  const year = 2025
  const effectiveDate = `${month} ${day}, ${year}`

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">{t("termsOfService.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("termsOfService.effectiveDate", { date: effectiveDate })}
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6 text-base leading-relaxed">
        <p>{t("termsOfService.welcome")}</p>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.description.title")}
          </h2>
          <p>{t("termsOfService.sections.description.content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.use.title")}
          </h2>
          <p>{t("termsOfService.sections.use.content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.license.title")}
          </h2>
          <p>
            {t("termsOfService.sections.license.part1")}{" "}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {t("termsOfService.sections.license.linkText")}
            </a>
            .
          </p>
          <p>{t("termsOfService.sections.license.part2")}</p>
          <p>
            {t("termsOfService.sections.license.part3")}{" "}
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
            {t("termsOfService.sections.wallet.title")}
          </h2>
          <p>{t("termsOfService.sections.wallet.content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.disclaimers.title")}
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>{t("termsOfService.sections.disclaimers.item1")}</li>
            <li>{t("termsOfService.sections.disclaimers.item2")}</li>
            <li>{t("termsOfService.sections.disclaimers.item3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.changes.title")}
          </h2>
          <p>{t("termsOfService.sections.changes.content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("termsOfService.sections.contact.title")}
          </h2>
          <p>
            {t("termsOfService.sections.contact.content")}{" "}
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
export default Term
