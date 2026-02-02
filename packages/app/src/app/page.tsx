import Dashboard from "@/components/dashboard/Dashboard"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Dashboard"),
}

export default function DashboardPage() {
  return <Dashboard />
}
