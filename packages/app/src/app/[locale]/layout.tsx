import { NextIntlClientProvider } from "next-intl"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import Footer from "@/components/Footer"
import Background from "@/components/Background"

export default function LocaleLayout({ children }: { children: React.ReactNode; }) {
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