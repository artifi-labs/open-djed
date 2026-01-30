import Privacy from "@/components/privacy/Privacy"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Privacy Policy"),
}

export default function PrivacyPage() {
  return <Privacy />
}
