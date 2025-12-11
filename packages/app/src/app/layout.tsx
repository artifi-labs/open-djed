import type { Metadata } from 'next'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { getLoaderData } from '@/lib/loader'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['sans-serif'],
})

export async function generateMetadata(): Promise<Metadata> {
  const { network } = await getLoaderData()

  const canonical = `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance`

  return {
    metadataBase: new URL(canonical),
    title: {
      default: `Open DJED | The open-source alternative to DJED.xyz`,
      template: `%s | Open DJED`,
    },
    applicationName: 'Open DJED',
    description:
      "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.",
    keywords: [
      'DJED',
      'SHEN',
      'Cardano',
      'stablecoin',
      'DeFi',
      'ADA',
      'Open Source',
      'Artifi Labs',
      'blockchain',
    ],
    authors: [{ name: 'Artifi Labs', url: canonical }],
    creator: 'Artifi Labs',
    publisher: 'Artifi Labs',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title: `Open DJED`,
      description:
        "Mint and burn DJED, Cardano's overcollateralized stablecoin, with transparency and open-source tools.",
      url: canonical,
      siteName: 'Open DJED',
      images: [
        {
          url: `${canonical}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Open DJED',
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Open DJED',
      description:
        'Mint and burn DJED, Cardano’s overcollateralized stablecoin, with a transparent and open-source UI.',
      images: [`${canonical}/og-image.png`],
      creator: '@artifi_labs',
      site: '@artifi_labs',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
    },
    manifest: '/manifest.json',
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const env = await getLoaderData()

  return (
    <html lang="en" className={inter.variable}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
				(function() {
				try {
					var m = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
					var theme = m ? m[1] : null;

					if (!theme) {
						theme = localStorage.getItem('theme');
					}

					var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					var isDark = (theme === 'dark') || (!theme && systemDark);

					var html = document.documentElement;
					// Remove any existing classes first
					html.classList.remove('dark', 'light');
					// Add the correct class
					html.classList.add(isDark ? 'dark' : 'light');
					} catch (e) {
					console.warn('Theme script error:', e);
					}
				})();
			`,
          }}
        />
      </Head>
      <body>
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
