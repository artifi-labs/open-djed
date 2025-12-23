"use client"

import Link from "next/link"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Button from "./Button"
import ButtonIcon from "./ButtonIcon"
import Image from "next/image"
import clsx from "clsx"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import Wallet, { type WalletName } from "./Wallet"
import Sidebar from "./modals/Sidebar"
import { shortenString } from "@/lib/utils"
import Logo from "./Logo"
import { useEnv } from "@/context/EnvContext"
import { useViewport } from "@/hooks/useViewport"
import Icon from "./Icon"

type NavigationItem = {
  label: string
  href: string
}

type NavigationItemsProps = {
  items: NavigationItem[]
  className?: string
  activePath: string
}

type NetworkBadgeProps = {
  network?: string
  className?: string
  onNetworkSwitch?: () => void
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  items,
  className,
  activePath,
}) => {
  const baseClassName = clsx(
    "hidden desktop:flex items-center gap-24",
    className,
  )

  return (
    <nav className={baseClassName} aria-label="Main navigation">
      {items.map((item) => {
        const isActive = activePath === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "desktop:text-md relative p-6 font-medium transition-all",
              isActive && "border-b-2",
            )}
            style={
              isActive
                ? {
                    borderImageSource: "var(--color-gradient-angular-2)",
                    borderImageSlice: 1,
                  }
                : {}
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  network,
  className,
  onNetworkSwitch,
}) => {
  const { isMobile } = useViewport()
  const altText = `network-icon`
  const basePath = "/components/badge-icon/"
  const srcFile = `${basePath}/elipse.svg`

  const baseClassName = clsx("flex gap-4 items-center", className)

  const targetNetwork = network === "Mainnet" ? "Preprod" : "Mainnet"

  return isMobile ? (
    <div
      className={clsx(baseClassName, "cursor-pointer")}
      onClick={onNetworkSwitch}
    >
      <Icon name="Swap-Horizontal" />
      <span className="text-sm font-medium">Switch to {targetNetwork}</span>
    </div>
  ) : (
    <div className={baseClassName}>
      <div className="relative" style={{ width: 4, height: 4 }}>
        <Image src={srcFile} alt={altText} fill className="object-contain" />
      </div>
      <span className="text-xs">{network}</span>
    </div>
  )
}

export const Navbar = () => {
  const { network, config } = useEnv()
  const { wallet } = useWallet()
  const { openWalletSidebar, openSettingsSidebar } = useSidebar()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleNetworkSwitch = () => {
    const targetNetwork = network === "Mainnet" ? "Preprod" : "Mainnet"
    if (config[targetNetwork]) {
      window.location.href = config[targetNetwork]
    }
  }

  const navLinks: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/" },
    // { label: "Analytics", href: "/analytics" },
    // { label: "YIELD Simulator", href: "/yield-simulator" },
    { label: "Orders", href: "/orders" },
  ]
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
      <div className="px-navbar-margin mx-auto flex w-full max-w-360 flex-row items-center justify-between py-18">
        <div className="desktop:w-67.75">
          <Logo />
        </div>

        {/* Navigation Items */}
        <NavigationItems items={navLinks} activePath={pathname} />

        {/* Right Side */}
        <div className="desktop:gap-12 flex items-center gap-10">
          {/* Desktop items */}
          <div className="desktop:flex hidden items-center gap-12">
            <NetworkBadge network={network} />
            <ButtonIcon
              variant="outlined"
              icon="Settings"
              size="medium"
              onClick={() => openSettingsSidebar()}
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
            logo={true}
            headerAction={
              <div className="flex gap-8">
                <ButtonIcon
                  variant="outlined"
                  icon="Settings"
                  size="medium"
                  onClick={() => {
                    openSettingsSidebar()
                    setIsMobileSidebarOpen(false)
                  }}
                />
                <div className="flex items-center">
                  <ButtonIcon
                    variant="onlyIcon"
                    icon="Close"
                    size="small"
                    onClick={() => {
                      setIsMobileSidebarOpen(false)
                    }}
                  />
                </div>
              </div>
            }
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          >
            <div className="flex h-full flex-col justify-between">
              <nav className="flex flex-col gap-6" aria-label="Main navigation">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "desktop:text-md w-fit p-6 font-medium transition-all",
                        isActive && "border-b-2",
                      )}
                      style={
                        isActive
                          ? {
                              borderImageSource:
                                "var(--color-gradient-angular-2)",
                              borderImageSlice: 1,
                            }
                          : {}
                      }
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="flex flex-col gap-24">
                <Button
                  text={walletButtonText}
                  variant={wallet ? "secondary" : "accent"}
                  size="medium"
                  onClick={() => openWalletSidebar()}
                  wallet={walletIcon}
                />
                <NetworkBadge
                  network={network}
                  className="justify-center"
                  onNetworkSwitch={handleNetworkSwitch}
                />
              </div>
            </div>
          </Sidebar>
        </div>
      </div>
    </header>
  )
}
