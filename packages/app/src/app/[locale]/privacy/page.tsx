import Privacy from "@/components/privacy/Privacy"
import { buildAlternates, buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("privacyPolicy.metadata.title")),
    alternates: await buildAlternates("/privacy"),
  }
}

export default function PrivacyPage() {
  return <Privacy />
}
