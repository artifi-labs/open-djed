import Order from "@/components/order/Order"
import { APP_NAME } from "@/lib/constants"
import { env } from "@/lib/envLoader"
import type { Metadata } from "next"

const { NETWORK } = env
const title = NETWORK === "Mainnet" ? APP_NAME : `${APP_NAME} | ${NETWORK}`

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | Orders`,
  },
}

export default function OrderPage() {
  return <Order />
}
