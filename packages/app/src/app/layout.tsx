import "./styles/globals.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import { Poppins } from "next/font/google"
import { getLoaderData } from "@/lib/loader"
import { Providers } from "./providers"
import Footer from "@/components/Footer"
import { Navbar } from "@/components/new-components/Navbar"
import Background from "@/components/new-components/Background"
import { type Metadata } from "next"
import {
  APP_NAME,
  OPEN_DJED_URL,
  TEAM_NAME,
  TWITTER_HANDLE,
  TWITTER_URL,
  WEBSITE_URL,
} from "@/lib/constants"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["sans-serif"],
})

export const metadata: Metadata = {
  metadataBase: new URL(OPEN_DJED_URL),
  title: {
    default: `${APP_NAME}`,
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
    title: `${APP_NAME}`,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
    url: OPEN_DJED_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${OPEN_DJED_URL}/logos/artifi_banner.png`,
        width: 512,
        height: 512,
        alt: `${APP_NAME}`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME}`,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const env = getLoaderData()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} bg-[#101e2b]`}
    >
      <body
        className={`${poppins.className} relative flex min-h-screen flex-col antialiased`}
      >
        <Background />
        <Providers
          apiUrl={env.apiUrl}
          network={env.network}
          config={env.config}
          posthog={env.posthog}
        >
          <Navbar />
          <main className="px-page-margin flex w-full flex-1 flex-col items-center">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
