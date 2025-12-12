import './styles/globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Poppins } from 'next/font/google'
import { getLoaderData } from '@/lib/loader'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer/Footer'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
  fallback: ['sans-serif'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const env = getLoaderData()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable}  bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text`}
    >
      <body className={`${poppins.className} flex min-h-screen flex-col antialiased`}>
        <Providers apiUrl={env.apiUrl} network={env.network} config={env.config} posthog={env.posthog}>
          <Header />
          <main className="flex w-full flex-1 flex-col items-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[160px]">
            <div className="infinite-background"></div>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
