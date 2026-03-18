import Privacy from "@/components/privacy/Privacy"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("privacyPolicy.pageTitle")),
    description: t("privacyPolicy.intro"),
  }
}

export default function PrivacyPage() {
  return <Privacy />
}
