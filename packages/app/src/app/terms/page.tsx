import Terms from "@/components/term/Term"
import { getDictionary } from "@/i18n/server"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.termsOfService.pageTitle),
  }
}

export default function TermsPage() {
  return <Terms />
}
