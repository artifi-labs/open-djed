import Dashboard from "@/components/dashboard/Dashboard"
import { getDictionary } from "@/i18n/server"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.dashboard.pageTitle),
  }
}

export default function DashboardPage() {
  return <Dashboard />
}
