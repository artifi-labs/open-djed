import AnalyticsPage from "@/components/analytics/Analytics"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: `Analytics`,
    template: `%s | Analytics`,
  },
}

export default function OrderPage() {
  return <AnalyticsPage />
}
