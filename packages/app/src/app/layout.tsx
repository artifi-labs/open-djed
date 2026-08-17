import "@/app/styles/globals.css"
import { Poppins } from "next/font/google"
import { getLocale } from "next-intl/server"
import { env } from "@/lib/envLoader"
import {
  APP_NAME,
  DISCORD_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  TEAM_NAME,
  TWITTER_URL,
  WEBSITE_URL,
} from "@/lib/constants"
import {
  buildAlternates,
  buildOpenGraph,
  buildTitle,
  buildTwitter,
} from "@/lib/metadata"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["sans-serif"],
})

export async function generateMetadata() {
  const title = buildTitle()
  const description =
    "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere."

  return {
    metadataBase: new URL(env.BASE_URL),
    title: title,
    applicationName: APP_NAME,
    description: description,
    keywords: [
      "Stablecoin",
      "DJED",
      "djed",
      "SHEN",
      "shen",
      "DeFi",
      "Cardano",
      "Open Source",
      "Artifi Labs",
      "Artifi Finance",
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
    alternates: await buildAlternates(),
    openGraph: buildOpenGraph({ title, description, url: env.BASE_URL }),
    twitter: buildTwitter({ title, description }),
    icons: {
      icon: "/logos/opendjed-icon.svg",
      shortcut: "/logos/opendjed-icon.svg",
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const alternates = await buildAlternates()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    alternateName: "DJED Stablecoin",
    url: alternates.canonical,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: TEAM_NAME,
      url: WEBSITE_URL,
      sameAs: [TWITTER_URL, GITHUB_URL, LINKEDIN_URL, DISCORD_URL],
    },
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${poppins.variable} bg-background-primary`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={`${poppins.className} relative flex min-h-screen flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
