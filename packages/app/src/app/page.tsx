import Dashboard from "@/components/dashboard/Dashboard"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: buildTitle("dashboard.pageTitle"),
  }
}

export default function DashboardPage() {
  return <Dashboard />
}
