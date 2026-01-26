import Dashboard from "@/components/dashboard/Dashboard"
import { APP_NAME } from "@/lib/constants"
import { env } from "@/lib/envLoader"
import type { Metadata } from "next"

const { NETWORK } = env
const title = NETWORK === "Mainnet" ? APP_NAME : `${APP_NAME} | ${NETWORK}`

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
  title: {
    default: title,
    template: `%s | Dashboard`,
  },
}

export default function DashboardPage() {
  return <Dashboard />
}
