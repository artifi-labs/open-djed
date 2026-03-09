import Analytics from "@/components/analytics/Analytics"
import { getDictionary } from "@/i18n/server"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.analytics.pageTitle),
  }
}

export default function AnalyticsPage() {
  return <Analytics />
}
