import type { MetadataRoute } from "next"
import { APP_NAME } from "@/lib/constants"

export default function manifest(): MetadataRoute.Manifest {
  const network = process.env.NEXT_PUBLIC_NETWORK || "Mainnet"
  const name = network === "Mainnet" ? APP_NAME : `${APP_NAME} | ${network}`

  return {
    name,
    short_name: APP_NAME,
    description:
      "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1822",
    theme_color: "#0d1822",
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
