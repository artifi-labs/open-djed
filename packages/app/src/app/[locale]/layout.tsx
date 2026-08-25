import { NextIntlClientProvider } from "next-intl"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import Footer from "@/components/Footer"
import Background from "@/components/Background"
import { getLocale, getTranslations } from "next-intl/server"
import {
  buildAlternates,
  buildOpenGraph,
  buildTitle,
  buildTwitter,
  OG_LOCALE_MAP,
} from "@/lib/metadata"

export async function generateMetadata() {
  const t = await getTranslations()
  const locale = await getLocale()

  const title = buildTitle()
  const description = t("metadata.layout.description")

  const keywords = [
    "Stablecoin",
    "Djed",
    "Shen",
    "DeFi",
    "Cardano",
    "Artifi Labs",
    "Artifi Finance",
    "Blockchain",
    "Cryptocurrency",
    "Web3",
    t("keywords.opensource"),
    t("keywords.software"),
    t("keywords.development"),
    t("keywords.defi_full"),
    t("keywords.software_dev"),
  ]

  const alternates = await buildAlternates()

  return {
    description: description,
    keywords: keywords,
    alternates,
    openGraph: buildOpenGraph({
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE_MAP[locale],
    }),
    twitter: buildTwitter({ title, description }),
  }
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextIntlClientProvider>
      <Background />
      <Providers>
        <Navbar />
        <main className="px-page-margin flex w-full flex-1 flex-col items-center">
          {children}
        </main>
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  )
}
