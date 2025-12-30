import "./styles/globals.css"
import { Poppins } from "next/font/google"
import { env } from "@/lib/envLoader"
import { Providers } from "./providers"
import Footer from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import Background from "@/components/Background"
import { type Metadata } from "next"
import {
  APP_NAME,
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

const { NETWORK } = env
const title = NETWORK === "Mainnet" ? APP_NAME : `${APP_NAME} | ${NETWORK}`

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
  title: {
    default: title,
    template: `%s | ${title}`,
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
    title: title,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
    url: env.BASE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${env.BASE_URL}/logos/opendjed-banner.png`,
        width: 512,
        height: 512,
        alt: `${APP_NAME} Banner`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: title,
    description: `Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.`,
    images: [`${env.BASE_URL}/logos/opendjed-banner.png`],
    creator: TWITTER_HANDLE,
    site: TWITTER_URL,
  },
  icons: {
    icon: "/logos/opendjed-icon.svg",
    shortcut: "/logos/opendjed-icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} bg-background-primary`}
    >
      <body
        className={`${poppins.className} relative flex min-h-screen flex-col antialiased`}
      >
        <Background />
        <Providers>
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
