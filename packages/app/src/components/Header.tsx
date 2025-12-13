"use client"

import { useEffect, useState } from "react"
import Button from "@/components/Button"
import Select from "@/components/Select"
import { useEnv } from "@/context/EnvContext"
import { useWallet } from "@/context/WalletContext"
import { ThemeToggle } from "./ThemeToggle"
import { FiEye, FiEyeOff, FiMenu, FiX } from "react-icons/fi"
import Sidebar from "./Sidebar"
import { useLocalStorage } from "usehooks-ts"
import { DEFAULT_SHOW_BALANCE } from "@/lib/utils"
import Tooltip from "./Tooltip"
import { useTranslation } from "react-i18next"
import Toast from "./Toast"
import Orders from "./Orders"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const SUPPORTED_WALLET_IDS = ["eternl", "lace", "vespr", "begin", "gerowallet"]

export const Header = () => {
  const { t } = useTranslation()
  const pathname = usePathname() // Add this hook
  const [isWalletSidebarOpen, setIsWalletSidebarOpen] = useState(false)
  const { network, config } = useEnv()
  const { wallet, wallets, connect, detectWallets, disconnect } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBalance, setShowBalance] = useLocalStorage<boolean | null>(
    "showBalance",
    DEFAULT_SHOW_BALANCE,
  )
  const [toastProps, setToastProps] = useState<{
    message: string
    type: "success" | "error"
    show: boolean
  }>({
    message: "",
    type: "success",
    show: false,
  })

  // Navigation links data
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/djed", label: "DJED" },
    { to: "/shen", label: "SHEN" },
  ]

  const getNavLinkClasses = (isActive: boolean) => {
    return `focus:outline-none transition-colors flex items-center p-2 ${
      isActive
        ? "text-primary font-bold bg-primary/15 rounded-md border-b-0 hover:bg-primary/30"
        : "hover:text-primary hover:border-primary"
    }`
  }

  useEffect(() => {
    if (isWalletSidebarOpen && !wallet) detectWallets()
  }, [isWalletSidebarOpen, wallet, detectWallets])

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  // Close the menu automatically on desktop (screen width greater than 1024px (lg))
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false) // Close the menu when screen size is large enough (desktop)
      }
    }

    // Listen for resize events
    window.addEventListener("resize", handleResize)

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const walletButtonText = wallet
    ? wallet.balance.handle
      ? `${wallet.balance.handle}`
      : wallet.address
        ? `${wallet.address.slice(0, 5)}...${wallet.address.slice(-6)}`
        : `${t("header.address.loading")}...`
    : t("header.wallet.connect")

  return (
    <>
      {/* Navbar */}
      <header className="bg-light-navbar dark:bg-dark-navbar dark:shadow-primary/30 sticky top-0 right-0 left-0 z-50 px-8 py-4 shadow-sm transition-all duration-200 ease-in-out">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/">
              <div className="flex flex-row items-center text-xl">
                <Image
                  width={100}
                  height={100}
                  src="/logos/djed.svg"
                  alt="Open DJED"
                />
                Open DJED
              </div>
            </Link>
          </div>

          {/* Center links - Desktop only */}
          <div className="mx-10 hidden justify-center space-x-6 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to}>
                <div className={getNavLinkClasses(pathname === link.to)}>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Right - Wallet & Select */}
          <div className="hidden flex-1 items-center justify-end space-x-4 lg:flex">
            <Select
              defaultValue={network}
              size="md"
              onChange={(e) => {
                window.location.href = config[e.target.value]
              }}
              options={Object.keys(config).map((key) => ({
                value: key,
                label: key,
              }))}
            />
            <ThemeToggle />
            <Button
              onClick={() => setIsWalletSidebarOpen(true)}
              className="w-48"
            >
              {walletButtonText}
            </Button>
          </div>

          {/* Menu toggle - Mobile only */}
          <div className="text-primary flex flex-row space-x-4 lg:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="dark:hover:bg-primary/30 rounded-md p-2 transition-colors hover:bg-gray-100 focus:outline-none"
            >
              {menuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Slide-out Mobile Menu */}
      <div
        className={`dark:bg-dark-bg fixed top-18 right-0 bottom-0 z-40 w-3/4 max-w-xs transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Scrollable content */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={toggleMenu}
                className={`${getNavLinkClasses(pathname === link.to)} border-primary/20 w-full justify-start border-b font-medium`}
              >
                {link.label}
              </Link>
            ))}
            <Select
              defaultValue={network}
              size="full"
              onChange={(e) => {
                window.location.href = config[e.target.value]
              }}
              options={Object.keys(config).map((key) => ({
                value: key,
                label: key,
              }))}
            />
          </div>
          {/* Bottom content */}
          <div className="px-6 py-4">
            <Button
              onClick={() => setIsWalletSidebarOpen(true)}
              className="w-full"
            >
              {walletButtonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Dark background*/}
      {menuOpen && (
        <div
          className="bg-dark-bg/80 fixed inset-0 z-30"
          onClick={toggleMenu}
        />
      )}

      {/* Wallet Sidebar */}
      <Sidebar
        isOpen={isWalletSidebarOpen}
        onClose={() => setIsWalletSidebarOpen(false)}
      >
        {wallet ? (
          <div
            className="flex h-full flex-col justify-start px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <div className="flex w-full flex-col items-start justify-start gap-4 border-b border-gray-300 pb-6">
                <h1 className="font-bold">{t("wallet.details")}:</h1>
                <div className="flex w-full flex-row items-center justify-center gap-6">
                  <span className="h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      width={100}
                      height={100}
                      src={wallet.icon}
                      alt="Wallet Icon"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <p>
                    {wallet.address
                      ? wallet.address.slice(0, 10) +
                        "..." +
                        wallet.address.slice(-10)
                      : t("header.address.not.detected")}
                  </p>
                  <Tooltip
                    text={t("wallet.disconnect")}
                    tooltipDirection="left"
                  >
                    <span className="cursor-pointer" onClick={disconnect}>
                      <i className="fa-solid fa-plug-circle-xmark w-full"></i>
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div
                className="flex w-full flex-col items-start justify-start gap-4 border-b border-gray-300 pb-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex w-full flex-row justify-between">
                  <h1 className="font-bold">
                    {t("header.available.balance")}:
                  </h1>
                  <Tooltip
                    text={`${showBalance ? t("common.hide") : t("common.show")} ${t("wallet.balance")}`}
                    tooltipDirection="left"
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </Tooltip>
                </div>
                <div className="flex w-full flex-row items-center justify-between gap-6 font-bold">
                  <span className="h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      width={100}
                      height={100}
                      src="/logos/cardano-ada-logo.svg"
                      alt="ADA logo"
                    />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.ADA}</span>
                    ) : (
                      <span className="mr-4 inline-block h-4 w-32 rounded-md bg-gray-300 blur-sm" />
                    )}
                    ADA
                  </p>
                </div>
                <div className="flex w-full flex-row items-center justify-between gap-6 font-bold">
                  <span className="h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      width={100}
                      height={100}
                      src="/logos/djed.svg"
                      alt="Djed logo"
                    />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.DJED}</span>
                    ) : (
                      <span className="mr-4 inline-block h-4 w-32 rounded-md bg-gray-300 blur-sm" />
                    )}
                    DJED
                  </p>
                </div>
                <div className="flex w-full flex-row items-center justify-between gap-6 font-bold">
                  <span className="h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      width={100}
                      height={100}
                      src="/logos/shen-logo.png"
                      alt="Shen logo"
                    />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.SHEN}</span>
                    ) : (
                      <span className="mr-4 inline-block h-4 w-32 rounded-md bg-gray-300 blur-sm" />
                    )}
                    SHEN
                  </p>
                </div>
              </div>
              <div
                className="flex w-full flex-col items-start justify-start gap-4 pb-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex w-full flex-col items-start justify-start gap-4">
                  <Orders wallet={wallet} setToastProps={setToastProps} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-start px-4 py-4">
            <div>
              {wallets.length === 0 ? (
                <p className="font-semibold text-red-500">
                  {t("wallet.not.detected")}.
                </p>
              ) : (
                <p className="py-4 pl-5 text-xl font-semibold">
                  {t("wallet.choose")}:
                </p>
              )}
            </div>
            {wallets
              .filter(({ id }) => SUPPORTED_WALLET_IDS.includes(id))
              .sort(
                (a, b) =>
                  SUPPORTED_WALLET_IDS.indexOf(a.id) -
                  SUPPORTED_WALLET_IDS.indexOf(b.id),
              )
              .map(({ id, name, icon }) => (
                <div
                  className="hover:bg-primary flex flex-row items-center justify-between gap-2 rounded-lg p-4 pr-6 hover:text-white"
                  key={id}
                  onClick={() => {
                    connect(id)
                  }}
                >
                  <div className="flex flex-row items-center justify-start">
                    <Image
                      width={100}
                      height={100}
                      src={icon}
                      alt={`${name} icon`}
                      className="mr-3 h-12 w-12"
                    />
                    <span className="text-lg">
                      {name.replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              ))}
          </div>
        )}
      </Sidebar>
      <Toast
        message={toastProps.message}
        show={toastProps.show}
        onClose={() => setToastProps({ ...toastProps, show: false })}
        type={toastProps.type}
      />
    </>
  )
}
