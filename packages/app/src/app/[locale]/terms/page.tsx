import Terms from "@/components/term/Term"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("termsOfService.pageTitle")),
  }
}

export default function TermsPage() {
  return <Terms />
}
