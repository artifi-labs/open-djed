import type { MetadataRoute } from "next"
import { APP_NAME } from "@/lib/constants"

export default function manifest(): MetadataRoute.Manifest {
  const network = process.env.NEXT_PUBLIC_NETWORK || "Mainnet"

  return {
    name: `${APP_NAME} | ${network}`,
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/logos/opendjed-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
