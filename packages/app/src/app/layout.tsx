import "./styles/globals.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import { Poppins } from "next/font/google"
import { getLoaderData } from "@/lib/loader"
import { Providers } from "./providers"
import { Header } from "@/components/Header"
import Footer from "@/components/Footer"
import { Navbar } from "@/components/new-components/Navbar"
import Background from "@/components/new-components/Background"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["sans-serif"],
})

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
