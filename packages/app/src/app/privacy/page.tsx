import Privacy from "@/components/privacy/Privacy"
import { getDictionary } from "@/i18n/server"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.privacyPolicy.pageTitle),
  }
}

export default function PrivacyPage() {
  return <Privacy />
}
