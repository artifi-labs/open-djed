import ErrorPage from "@/components/new-components/ErroPage"
import PageFade from "@/components/new-components/PageFade"
import {
  OPEN_DJED_URL,
  APP_NAME,
  TEAM_NAME,
  WEBSITE_URL,
  TWITTER_HANDLE,
  TWITTER_URL,
} from "@/lib/constants"
import { type Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(OPEN_DJED_URL),
  title: {
    default: `${APP_NAME} | Page Not Found`,
    template: `%s | ${APP_NAME}`,
  },
  applicationName: APP_NAME,
  description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
  keywords: [
    "DJED",
    "djed",
    "SHEN",
    "shen",
    "DeFi",
    "Cardano",
    "Open Source",
    "Community-led",
    "Artifi Labs",
    "Software",
    "Development",
    "Blockchain",
    "Cryptocurrency",
    "Decentralized Finance",
    "Software Development",
    "web3",
  ],
  authors: [{ name: TEAM_NAME, url: WEBSITE_URL }],
  creator: TEAM_NAME,
  publisher: TEAM_NAME,
  alternates: {
    canonical: WEBSITE_URL,
  },
  openGraph: {
    type: "website",
    title: `${APP_NAME} | Page Not Found`,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
    url: OPEN_DJED_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${OPEN_DJED_URL}/logos/artifi_banner.png`,
        width: 512,
        height: 512,
        alt: `${APP_NAME} | Page Not Found`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} | Page Not Found`,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
    images: [`${OPEN_DJED_URL}/logos/artifi_banner.png`],
    creator: TWITTER_HANDLE,
    site: TWITTER_URL,
  },
  icons: {
    icon: "/logos/opendjed-icon.svg",
    shortcut: "/logos/opendjed-icon.svg",
  },
  manifest: "/manifest.json",
}

export default function NotFound() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <PageFade>
        <ErrorPage
          statusCode={404}
          title="Lost in the blockchain void"
          subtitle={`This page has drifted off the network.\nLet's reconnect you to the main chain`}
          buttonText="Return Home"
          buttonHref="/"
        />
      </PageFade>
    </main>
  )
}
