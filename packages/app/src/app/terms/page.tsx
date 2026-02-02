import Terms from "@/components/term/Term"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Terms of Service"),
}

export default function TermsPage() {
  return <Terms />
}
