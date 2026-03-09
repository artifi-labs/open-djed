import Analytics from "@/components/analytics/Analytics"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: buildTitle("analytics.pageTitle"),
  }
}

export default function AnalyticsPage() {
  return <Analytics />
}
