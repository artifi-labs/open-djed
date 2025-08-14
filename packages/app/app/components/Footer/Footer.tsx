import { type JSX } from 'react'
import FooterIcon from './FooterIcon'
import Tooltip from '../Tooltip'

interface FooterLink {
  label: string
  href: string
  tooltip: string
  lightIcon?: string
  darkIcon?: string
  element?: JSX.Element
}

const Footer = () => {
  const footerLinks: FooterLink[] = [
    {
      label: 'Discord',
      href: 'https://discord.gg/MhYP7w8n8p',
      tooltip: 'Join our community Discord server',
      lightIcon: '/logos/discord-logo.png',
    },
    {
      label: 'Twitter',
      href: 'https://x.com/artifex_labs',
      tooltip: 'Follow us for more news',
      lightIcon: '/logos/x-dark-logo.svg',
      darkIcon: '/logos/x-logo.svg',
    },
    {
      label: 'Github',
      href: 'https://github.com/artifex-labs/open-djed',
      tooltip: 'Look at source code',
      lightIcon: '/logos/github-dark.svg',
      darkIcon: '/logos/github-white.svg',
    },
    {
      label: 'djed.xyz',
      href: 'https://djed.xyz',
      tooltip: 'Official djed app',
      lightIcon: '/logos/djed.svg',
    },
    {
      label: 'Status',
      href: 'https://status.artifex.finance/',
      tooltip: 'Service status page',
      element: <i className="fas fa-heartbeat text-red-500"></i>,
    },
    {
      label: 'Terms',
      href: '/terms',
      tooltip: 'Terms of Service',
      element: <i className="fas fa-file-contract text-primary-500"></i>,
    },
    {
      label: 'Privacy',
      href: '/privacy',
      tooltip: 'Privacy Policy',
      element: <i className="fas fa-user-secret text-primary-500"></i>,
    },
  ]

  return (
    <footer className="flex flex-col md:flex-row gap-8 p-8 justify-between bg-light-footer dark:bg-dark-footer border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <a href="https://artifex.finance/">
          <img src="/logos/artifex-logo.png" alt="Artifex Labs Logo" className="w-[50px]" />
        </a>
        <p className="pt-1">All rights reserved © 2025</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {footerLinks.map(({ label, href, tooltip, element, lightIcon, darkIcon }) => (
          <div key={label}>
            <Tooltip
              text={tooltip}
              children={
                <a
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
