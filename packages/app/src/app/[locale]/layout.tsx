import { NextIntlClientProvider } from "next-intl"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import Footer from "@/components/Footer"
import Background from "@/components/Background"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

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

  return {
    description: description,
    keywords: keywords,
    openGraph: {
      description: description,
    },
    twitter: {
      description: description,
    },
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
