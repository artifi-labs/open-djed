"use client"

import { useTranslation } from "react-i18next"
import Link from "next/link"
import Image from "next/image"
import Icon, { IconName } from "./new-components/Icon"
import ButtonIcon from "./new-components/ButtonIcon"
import React from "react"
import { useViewport } from "@/hooks/useViewport"
import {
  DISCORD_URL,
  DJED_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  STATUS_URL,
  TWITTER_URL,
  WEBSITE_URL,
} from "@/lib/constants"

type FooterItem = {
  label: string
  href: string
  icon?: IconName
}

type SocialIcon = {
  icon: IconName
  href: string
}

type SocialIconProps = {
  items: SocialIcon[]
}

const Logo = () => {
  return (
    <Link href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
      <Image
        src="/logos/artifilabs-logo.svg"
        alt="Artifi Logo"
        width={98}
        height={22}
      />
    </Link>
  )
}

const SocialIcons: React.FC<SocialIconProps> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <ButtonIcon
          id={`social-icon-${item.icon}`}
          key={item.icon}
          variant="outlined"
          size="small"
          icon={item.icon}
          onClick={() =>
            window.open(item.href, "_blank", "noopener,noreferrer")
          }
        />
      ))}
    </>
  )
}

const Footer = () => {
  const { t } = useTranslation()
  const { isMobile, isDesktop } = useViewport()

  const footerItems: FooterItem[] = [
    {
      label: "Privacy Policy",
      href: "/privacy",
    },
    {
      label: "Terms & Conditions",
      href: "/terms",
    },
    {
      label: "DJED",
      href: DJED_URL,
      icon: "External",
    },
  ]

  const socialIcons: SocialIcon[] = [
    {
      icon: "Checkmark",
      href: STATUS_URL,
    },
    {
      icon: "Github",
      href: GITHUB_URL,
    },
    {
      icon: "Discord",
      href: DISCORD_URL,
    },
    {
      icon: "Twitter",
      href: TWITTER_URL,
    },
    {
      icon: "Linkedin",
      href: LINKEDIN_URL,
    },
  ]

  const MobileFooter = () => {
    return (
      <footer className="px-page-margin flex flex-col gap-24 pt-20 pb-12">
        <div className="flex flex-row justify-between px-8">
          <Logo />
          <div className="flex gap-10">
            <SocialIcons items={socialIcons} />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          {footerItems.map((item) => (
            <Link
              key={item.label}
              id={`footer-item-${item.label.toLowerCase()}`}
              href={item.href}
              className="p-6"
            >
              <div className="flex flex-row gap-4">
                <p className="text-xs font-medium">{item.label}</p>
                {item.icon && <Icon name={item.icon} size={16} />}
              </div>
            </Link>
          ))}
        </div>
        <div className="bg-border-footer-gradient h-[1px]" />
        <div className="flex flex-row justify-start gap-4">
          <Icon name="Legal" size={16} />
          <p className="text-xs">2025 Artifi. All rights are reserved</p>
        </div>
      </footer>
    )
  }

  const DesktopFooter = () => {
    return (
      <footer className="px-navbar-margin pb-navbar-margin flex flex-col gap-24 pt-36">
        <div className="flex flex-row justify-between">
          <Logo />
          <div className="flex flex-row items-center gap-40">
            {footerItems.map((item) => (
              <Link key={item.label} href={item.href} className="p-6">
                <div className="flex flex-row gap-4">
                  <p className="text-xs font-medium">{item.label}</p>
                  {item.icon && <Icon name={item.icon} size={16} />}
                </div>
              </Link>
            ))}
          </div>
          <div className="flex gap-16">
            <SocialIcons items={socialIcons} />
          </div>
        </div>
        <div className="bg-border-footer-gradient h-[1px]" />
        <div className="flex flex-row justify-center gap-4">
          <Icon name="Legal" size={16} />
          <p className="text-xs font-medium">
            2025 Artifi. All rights are reserved
          </p>
        </div>
      </footer>
    )
  }

  if (!isMobile && !isDesktop) return null

  return (
    <>
      {isMobile && <MobileFooter />}
      {isDesktop && <DesktopFooter />}
    </>
  )
}

export default Footer
