import { type JSX } from 'react'
import FooterIcon from './FooterIcon'
import Tooltip from '../Tooltip'
import { useTranslation } from 'react-i18next'

interface FooterLink {
  id: string
  label: string
  href: string
  tooltip: string
  lightIcon?: string
  darkIcon?: string
  element?: JSX.Element
}

const currentYear = new Date().getFullYear()

const Footer = () => {
  const { t } = useTranslation()

  const footerLinks: FooterLink[] = [
    {
      id: 'discord-link',
      label: 'Discord',
      href: 'https://discord.gg/MhYP7w8n8p',
      tooltip: t('footer.tooltips.discord'),
      lightIcon: '/logos/discord-logo.png',
    },
    {
      id: 'twitter-link',
      label: 'Twitter',
      href: 'https://x.com/artifi_labs',
      tooltip: t('footer.tooltips.twitter'),
      lightIcon: '/logos/x-dark-logo.svg',
      darkIcon: '/logos/x-logo.svg',
    },
    {
      id: 'github-link',
      label: 'Github',
      href: 'https://github.com/artifi-labs/open-djed',
      tooltip: t('footer.tooltips.github'),
      lightIcon: '/logos/github-dark.svg',
      darkIcon: '/logos/github-white.svg',
    },
    {
      id: 'djed-link',
      label: 'djed.xyz',
      href: 'https://djed.xyz',
      tooltip: t('footer.tooltips.djed'),
      lightIcon: '/logos/djed.svg',
    },
    {
      id: 'status-link',
      label: t('footer.links.status'),
      href: 'https://status.artifi.finance/',
      tooltip: t('footer.tooltips.status'),
      element: <i className="fas fa-heartbeat text-red-500"></i>,
    },
    {
      id: 'terms-link',
      label: t('footer.links.terms'),
      href: '/terms',
      tooltip: t('footer.tooltips.terms'),
      element: <i className="fas fa-file-contract text-primary-500"></i>,
    },
    {
      id: 'privacy-link',
      label: t('footer.links.privacy'),
      href: '/privacy',
      tooltip: t('footer.tooltips.privacy'),
      element: <i className="fas fa-user-secret text-primary-500"></i>,
    },
  ]

  return (
    <footer className="flex flex-col md:flex-row gap-8 p-8 justify-between bg-light-footer dark:bg-dark-footer border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <a href="https://artifi.finance/">
          <img src="/logos/artifi-logo.png" alt="Artifi Labs Logo" className="w-[50px]" />
        </a>
        <p className="pt-1">{t('footer.rightsReserved', { year: currentYear })}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {footerLinks.map(({ id, label, href, tooltip, element, lightIcon, darkIcon }) => (
          <div key={label}>
            <Tooltip
              text={tooltip}
              children={
                <a
                  id={id}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="hover:text-primary focus:outline-none transition-colors flex items-center gap-1"
                >
                  <FooterIcon element={element} lightIcon={lightIcon} darkIcon={darkIcon} label={label} />
                  <span>{label}</span>
                </a>
              }
            />
          </div>
        ))}
      </div>
    </footer>
  )
}

export default Footer
