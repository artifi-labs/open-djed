import "@/app/styles/globals.css"
import { Poppins } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import Footer from "@/components/Footer"
import Background from "@/components/Background"
import { getMessages, getTranslations } from "next-intl/server"
import { type Metadata, type Viewport } from "next"
import { env } from "@/lib/envLoader"
import {
  APP_NAME,
  TEAM_NAME,
  TWITTER_HANDLE,
  TWITTER_URL,
  WEBSITE_URL,
} from "@/lib/constants"
import { buildTitle } from "@/lib/metadata"
import StructuredData from "@/components/StructuredData"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["sans-serif"],
})

export const viewport: Viewport = {
  themeColor: "#0d1822",
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale })
  const title = buildTitle()

  const keywords = [
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
    "Blockchain",
    "Cryptocurrency",
    "Decentralized Finance",
    "Software Development",
    "web3",
    t("keywords.opensource"),
    t("keywords.software"),
    t("keywords.development"),
    t("keywords.defi_full"),
    t("keywords.software_dev"),
  ]

  return {
    metadataBase: new URL(env.BASE_URL),
    title: title,
    applicationName: APP_NAME,
    description: t("metadata.layout.description"),
    keywords: keywords,
    authors: [{ name: TEAM_NAME, url: WEBSITE_URL }],
    creator: TEAM_NAME,
    publisher: TEAM_NAME,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: WEBSITE_URL,
    },
    openGraph: {
      type: "website",
      title: title,
      description: t("metadata.layout.description"),
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
      locale: locale === "pt" ? "pt_PT" : "en_US",
    },
    twitter: {
      card: "summary",
      title: title,
      description: t("metadata.layout.description"),
      images: [`${env.BASE_URL}/logos/opendjed-banner.png`],
      creator: TWITTER_HANDLE,
      site: TWITTER_URL,
    },
    icons: {
      icon: "/logos/opendjed-icon.svg",
      shortcut: "/logos/opendjed-icon.svg",
    },
  }
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  const { children } = props
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${poppins.variable} bg-background-primary`}
    >
      <body
        className={`${poppins.className} relative flex min-h-screen flex-col antialiased`}
      >
        <StructuredData />
        <NextIntlClientProvider messages={messages}>
          <Background />
          <Providers>
            <Navbar />
            <main className="px-page-margin flex w-full flex-1 flex-col items-center">
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
