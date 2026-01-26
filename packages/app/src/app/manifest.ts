import type { MetadataRoute } from "next"
import { APP_NAME } from "@/lib/constants"
import { env } from "@/lib/envLoader"

export default function manifest(): MetadataRoute.Manifest {
  const { NETWORK } = env
  const name = NETWORK === "Mainnet" ? APP_NAME : `${APP_NAME} | ${NETWORK}`
  const themeColor = "#0d1822"

  return {
    name,
    short_name: APP_NAME,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin,
      with our open-source platform.`,
    start_url: "/",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logos/opendjed-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
