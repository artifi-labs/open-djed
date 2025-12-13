"use client"

import Link from "next/link"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "./Button"
import ButtonIcon from "./ButtonIcon"
import Image from "next/image"
import clsx from "clsx"
import Icon from "./Icon"
import { useWallet } from "@/context/WalletContext"
import { useWalletSidebar } from "@/context/SidebarContext"
import Wallet, { WalletName } from "./Wallet"
import Sidebar from "./modals/Sidebar"
import Divider from "./Divider"
import { shortenString } from "@/lib/utils"

export type NavbarProps = {
  walletConnected?: boolean
}

type NavigationItem = {
  label: string
  href: string
}

type NavigationItemsProps = {
  items: NavigationItem[]
  className?: string
}

type NetworkBadgeProps = {
  network?: string
  className?: string
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  items,
  className,
}) => {
  const baseClassName = clsx(
    "hidden desktop:flex items-center gap-24",
    className,
  )

  return (
    <nav className={baseClassName} aria-label="Main navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="desktop:text-md p-6 font-medium"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="/logos/opendjed-logo.svg"
        alt="Open Djed Logo"
        width={123}
        height={28}
      />
    </Link>
  )
}

const NetworkBadge: React.FC<NetworkBadgeProps> = ({ network, className }) => {
  const altText = `network-icon`
  const basePath = "/components/badge-icon/"
  const srcFile = `${basePath}/elipse.svg`

  const baseClassName = clsx("flex gap-4 items-center", className)

  return (
    <div className={baseClassName}>
      <div className="relative" style={{ width: 4, height: 4 }}>
        <Image src={srcFile} alt={altText} fill className="object-contain" />
      </div>
      <span className="text-xs">{network}</span>
    </div>
  )
}

const navLinks: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/" },
  { label: "Analytics", href: "/analytics" },
  { label: "YIELD Simulator", href: "/yield-simulator" },
  { label: "Orders", href: "/orders" },
]

export const Navbar: React.FC<NavbarProps> = ({ walletConnected }) => {
  const { t } = useTranslation()
  const { wallet } = useWallet()
  const { openWalletSidebar } = useWalletSidebar()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const getWalletButtonText = () => {
    if (!wallet) return "Connect wallet"
    if (wallet.balance.handle) return `$${wallet.balance.handle}`
    if (wallet.address) return `${shortenString(wallet.address)}`
    return "Loading address..."
  }
  const walletButtonText = getWalletButtonText()
  const walletIcon = wallet && (
    <Wallet name={wallet.name.toUpperCase() as WalletName} size={22} />
  )

  return (
    <header className="w-full">
      <div className="px-navbar-margin mx-auto flex w-full max-w-[1440px] flex-row items-center justify-between py-18">
        <div className="desktop:w-[271px]">
          <Logo />
        </div>

        {/* Navigation Items */}
        <NavigationItems items={navLinks} />

        {/* Right Side */}
        <div className="desktop:gap-12 flex items-center gap-10">
          {/* Desktop items */}
          <div className="desktop:flex hidden items-center gap-12">
            <NetworkBadge network="Mainnet" />
            <ButtonIcon
              variant="outlined"
              icon="Settings"
              size="medium"
              onClick={() => alert("Settings")}
            />
          </div>

          {/* Wallet button */}
          <Button
            text={walletButtonText}
            variant={wallet ? "secondary" : "accent"}
            size="medium"
            onClick={() => openWalletSidebar()}
            wallet={walletIcon}
          />

          {/* Menu button */}
          <ButtonIcon
            className="desktop:hidden cursor-pointer"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            icon={"Menu"}
          />

          <Sidebar
            title="Menu"
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          >
            <nav className="flex flex-col gap-6" aria-label="Main navigation">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="desktop:text-md p-6 font-medium"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Sidebar>
        </div>
      </div>
    </header>
  )
}
