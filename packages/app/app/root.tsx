import './app.css'
import 'i18n'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router'
import { links as fontLinks } from './lib/loader'
import { loader as rootLoader } from './lib/loader'
import { ClientProvider } from './context/ApiClientContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import type { LoaderData } from './types/loader'
import { ThemeProvider } from './context/ThemeContext'

export { fontLinks as links }
export { rootLoader as loader }

const queryClient = new QueryClient()

export default function App() {
  const { apiUrl, network, config, initialIsDark, posthog } = useLoaderData<LoaderData>()

  return (
    <html className={initialIsDark || ''}>
      <head>
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
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <ClientProvider apiUrl={apiUrl}>
            <QueryClientProvider client={queryClient}>
              <Layout apiUrl={apiUrl} network={network} config={config} posthog={posthog}>
                <Outlet />
              </Layout>
            </QueryClientProvider>
          </ClientProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
