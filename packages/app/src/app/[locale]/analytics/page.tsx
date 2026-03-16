import Analytics from "@/components/analytics/Analytics"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("analytics.pageTitle")),
  }
}

export default function AnalyticsPage() {
  return <Analytics />
}
