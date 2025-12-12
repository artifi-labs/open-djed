"use client"

import { useTranslation } from "react-i18next"
import Link from "next/link"
import Image from "next/image"
import Icon, { IconName } from "./new-components/Icon"
import ButtonIcon from "./new-components/ButtonIcon"
import React from "react"

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
    <Image
      src="/logos/artifilabs-logo.svg"
      alt="Artifi Logo"
      width={98}
      height={22}
    />
  )
}

const SocialIcons: React.FC<SocialIconProps> = ({ items }) => {
  return (
    <>
      {items.map((item, index) => (
        <ButtonIcon
          key={index}
          variant="outlined"
          size="small"
          icon={item.icon}
        />
      ))}
    </>
  )
}

const Footer = () => {
  const { t } = useTranslation()

  const footerItems: FooterItem[] = [
    {
      label: "Privacy Policy",
      href: "https://discord.gg/MhYP7w8n8p",
    },
    {
      label: "Terms & Conditions",
      href: "https://discord.gg/MhYP7w8n8p",
    },
    {
      label: "DJED",
      href: "https://discord.gg/MhYP7w8n8p",
      icon: "External",
    },
  ]

  const socialIcons: SocialIcon[] = [
    {
      icon: "Checkmark",
      href: "#",
    },
    {
      icon: "Discord",
      href: "#",
    },
    {
      icon: "Github",
      href: "#",
    },
    {
      icon: "Twitter",
      href: "#",
    },
  ]

  const MobileFooter = () => {
    return (
      <footer className="px-page-margin flex flex-col gap-24 pt-20 pb-12">
        <div className="flex flex-row justify-between">
          <Logo />
          <div className="flex gap-10">
            <SocialIcons items={socialIcons} />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          {footerItems.map((item, index) => (
            <Link key={index} href={item.href} className="p-6">
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
            {footerItems.map((item, index) => (
              <Link key={index} href={item.href} className="p-6">
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

  return <DesktopFooter />
}

export default Footer
