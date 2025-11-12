import { useLoaderData } from 'react-router'
import type { LoaderData } from '~/types/loader'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | Privacy Policy' },
    { name: 'description', content: 'Learn how Open DJED handles your data and privacy.' },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance/privacy`,
    },
  ]
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">Effective Date: June 3, 2025</p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-6 text-base leading-relaxed">
        <p>
          Artifi Labs is committed to privacy and transparency. This Privacy Policy outlines what data we
          collect and how it is used.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Data Collection</h2>
          <p>
            We do <strong>not</strong> collect any personal data.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium mb-1">Wallets</h3>
          <p>
            When users interact with the app using their Cardano wallet, we interact only with the wallet
            interface via the CIP-30 standard. We do not receive or store your private keys. We reserve the
            right to store your addresses and transactions for analytical purposes to allow us to learn from
            your usage of the app and to improve it based on this information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Cookies</h2>
          <p>
            We use cookies <strong>only</strong> to store user preferences, such as:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Light/dark theme selection</li>
            <li>Network choice (e.g., mainnet or preprod)</li>
          </ul>
          <p>
            These cookies are <strong>not used for tracking</strong> and do <strong>not</strong> store any
            personally identifiable information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Analytics and Telemetry</h2>
          <p>
            We use PostHog to collect limited analytics and application telemetry. This helps us understand
            how the app is used and identify bugs or performance issues.
          </p>
          <p>
            Data collected by PostHog does <strong>not</strong> include personally identifiable information.
            We do <strong>not</strong> store wallet addresses, names, emails, or any user credentials.
          </p>
          <p>All analytics are used strictly for the purpose of improving the application experience.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Open Source</h2>
          <p>
            This application is open source and licensed under the{' '}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              GNU General Public License v3.0
            </a>
            .
          </p>
          <p>
            Source code:{' '}
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
          <h2 className="text-xl font-semibold mb-2">5. No Authentication</h2>
          <p>
            The application does not use or require any user accounts, logins, or email registration. Access
            is anonymous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Updates to This Policy</h2>
          <p>We may revise this policy over time. Updates will be posted here with a new effective date.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:{' '}
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
