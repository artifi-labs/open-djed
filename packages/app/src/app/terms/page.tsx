import Terms from "@/components/term/Term"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: buildTitle("termsOfService.pageTitle"),
  }
}

export default function TermsPage() {
  return <Terms />
}
