import Analytics from "@/components/analytics/Analytics"
import { buildAlternates, buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("analytics.metadata.title")),
    description: t("analytics.metadata.description"),
    alternates: await buildAlternates("/analytics"),
  }
}

export default function AnalyticsPage() {
  return <Analytics />
}
