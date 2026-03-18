import Dashboard from "@/components/dashboard/Dashboard"
import { buildTitle } from "@/lib/metadata"

import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return {
    title: buildTitle(t("dashboard.pageTitle")),
    description: t("metadata.layout.description"),
  }
}

export default function DashboardPage() {
  return <Dashboard />
}
