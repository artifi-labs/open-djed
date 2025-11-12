import { useLoaderData } from 'react-router'
import type { LoaderData } from '~/types/loader'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | Terms of Service' },
    { name: 'description', content: 'Review the terms of using Open DJED.' },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance/terms`,
    },
  ]
}

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Effective Date: May 15, 2025</p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-6 text-base leading-relaxed">
        <p>
          Welcome to Open Djed! By accessing or using our application, you agree to be bound by these Terms of
          Service ("Terms"). If you do not agree with any part of these Terms, you may not use the
          application.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Description</h2>
          <p>
            Open Djed is an open-source web application that interacts with the Cardano blockchain. Users can
            connect their Cardano wallets via the CIP-30 standard to interact with the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Use of the Application</h2>
          <p>
            You agree to use the application in compliance with all applicable laws and regulations. You may
            not use the application in any manner that could harm, disable, or impair the application or
            interfere with others’ use of it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Open Source License</h2>
          <p>
            This application is open source and licensed under the{' '}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              GNU General Public License v3.0 (GPL-3.0)
            </a>
            .
          </p>
          <p>
            You are free to use, modify, and redistribute the software, provided that any modifications or
            derivative works are also licensed under the GPL-3.0 license. You must include a copy of the GPL
            license when redistributing.
          </p>
          <p>
            View the source code on GitHub:{' '}
            <a
              href="https://github.com/artifi-labs/open-djed"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              github.com/artifi-labs/open-djed
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Wallet Interactions</h2>
          <p>
            The application uses the Cardano CIP-30 wallet integration standard to enable users to connect
            supported wallets. We do not control, store, or transmit wallet private keys. All interactions
            with the blockchain occur via the user's wallet provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Disclaimers</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>This application is provided "as is", without warranty of any kind.</li>
            <li>We make no guarantees regarding uptime, correctness, or suitability for any purpose.</li>
            <li>Users are responsible for any transactions they submit using their wallet.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes</h2>
          <p>
            We may revise these Terms from time to time. Any changes will be reflected on this page with an
            updated effective date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>
            For questions about these Terms, contact us at:{' '}
            <a
              href="https://discord.gg/MhYP7w8n8p"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Discord
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
