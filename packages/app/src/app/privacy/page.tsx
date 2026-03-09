import Privacy from "@/components/privacy/Privacy"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: buildTitle("privacyPolicy.pageTitle"),
  }
}

export default function PrivacyPage() {
  return <Privacy />
}
