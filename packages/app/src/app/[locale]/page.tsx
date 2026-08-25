import Dashboard from "@/components/dashboard/Dashboard"
import { buildAlternates, buildTitle } from "@/lib/metadata"

import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return {
    title: buildTitle(t("dashboard.pageTitle")),
    alternates: await buildAlternates(),
  }
}

export default function DashboardPage() {
  return <Dashboard />
}
