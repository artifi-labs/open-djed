import "@/app/styles/globals.css"
import { Poppins } from "next/font/google"
import { env } from "@/lib/envLoader"
import {
  APP_NAME,
  TEAM_NAME,
  TWITTER_HANDLE,
  TWITTER_URL,
  WEBSITE_URL,
} from "@/lib/constants"
import { buildTitle } from "@/lib/metadata"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["sans-serif"],
})

export function generateMetadata() {
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
    alternates: {
      canonical: WEBSITE_URL,
      languages: {
        en: WEBSITE_URL,
        pt: `${WEBSITE_URL}/pt`,
        es: `${WEBSITE_URL}/es`,
        fr: `${WEBSITE_URL}/fr`,
        de: `${WEBSITE_URL}/de`,
        cn: `${WEBSITE_URL}/cn`,
        ja: `${WEBSITE_URL}/ja`,
        "x-default": WEBSITE_URL,
      },
    },
    openGraph: {
      type: "website",
      title: title,
      description: description,
      url: env.BASE_URL,
      siteName: APP_NAME,
      images: [
        {
          url: `/logos/opendjed-banner.png`,
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
      description: description,
      images: [`/logos/opendjed-banner.png`],
      creator: TWITTER_HANDLE,
      site: TWITTER_URL,
    },
    icons: {
      icon: "/logos/opendjed-icon.svg",
      shortcut: "/logos/opendjed-icon.svg",
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Open DJED",
    alternateName: "DJED Stablecoin",
    url: env.BASE_URL,
  }

  return (
    <html
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
