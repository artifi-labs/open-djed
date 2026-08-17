import Terms from "@/components/term/Term"
import { buildAlternates, buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("termsOfService.pageTitle")),
    alternates: await buildAlternates("/terms"),
  }
}

export default function TermsPage() {
  return <Terms />
}
