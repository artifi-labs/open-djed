import Analytics from "@/components/analytics/Analytics"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Analytics"),
}

export default function AnalyticsPage() {
  return <Analytics />
}
