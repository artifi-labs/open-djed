import { useLoaderData } from 'react-router'
import type { LoaderData } from '~/types/loader'
import { useTranslation, Trans } from 'react-i18next'

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
  const { t } = useTranslation()

  const month = t('months.june')
  const day = 3
  const year = 2025
  const effectiveDate = `${month} ${day}, ${year}`

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">{t('privacy.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('privacy.effectiveDate', { date: effectiveDate })}
        </p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-6 text-base leading-relaxed">
        <p>{t('privacy.intro')}</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.dataCollection')}</h2>
          <p>
            <Trans i18nKey="privacy.paragraphs.noPersonalData" components={{ strong: <strong /> }} />
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium mb-1">{t('privacy.sections.wallets')}</h3>
          <p>{t('privacy.paragraphs.wallet')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.cookies')}</h2>
          <p>
            <Trans i18nKey="privacy.paragraphs.cookies" components={{ strong: <strong /> }} />
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('privacy.list.theme')}</li>
            <li>{t('privacy.list.network')}</li>
          </ul>
          <p>
            <Trans i18nKey="privacy.paragraphs.cookiesDetails" components={{ strong: <strong /> }} />
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.analytics')}</h2>
          <p>{t('privacy.paragraphs.analytics1')}</p>
          <p>
            <Trans i18nKey="privacy.paragraphs.analytics2" components={{ strong: <strong /> }} />
          </p>
          <p>{t('privacy.paragraphs.analytics3')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.openSource')}</h2>
          <p>
            {t('privacy.paragraphs.openSource')}{' '}
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
            {t('privacy.paragraphs.sourceCode')}{' '}
            <a
              href="https://github.com/artifex-labs/open-djed"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              github.com/artifex-labs/open-djed
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.authentication')}</h2>
          <p>{t('privacy.paragraphs.authentication')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.policy')}</h2>
          <p> {t('privacy.paragraphs.policy')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('privacy.sections.contact')}</h2>
          <p>
            {t('privacy.paragraphs.contact')}{' '}
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
