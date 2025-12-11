'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Select from '@/components/Select'
import { useEnv } from '@/context/EnvContext'
import { useWallet } from '@/context/WalletContext'
import { ThemeToggle } from './ThemeToggle'
import { FiEye, FiEyeOff, FiMenu, FiX } from 'react-icons/fi'
import Sidebar from './Sidebar'
import { useLocalStorage } from 'usehooks-ts'
import { DEFAULT_SHOW_BALANCE } from '@/lib/utils'
import Tooltip from './Tooltip'
import { useTranslation } from 'react-i18next'
import Toast from './Toast'
import Orders from './Orders'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Add this import

const SUPPORTED_WALLET_IDS = ['eternl', 'lace', 'vespr', 'begin', 'gerowallet']

export const Header = () => {
  const { t } = useTranslation()
  const pathname = usePathname() // Add this hook
  const [isWalletSidebarOpen, setIsWalletSidebarOpen] = useState(false)
  const { network, config } = useEnv()
  const { wallet, wallets, connect, detectWallets, disconnect } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBalance, setShowBalance] = useLocalStorage<boolean | null>('showBalance', DEFAULT_SHOW_BALANCE)
  const [toastProps, setToastProps] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>(
    {
      message: '',
      type: 'success',
      show: false,
    },
  )

  // Navigation links data
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/djed', label: 'DJED' },
    { to: '/shen', label: 'SHEN' },
  ]

  const getNavLinkClasses = (isActive: boolean) => {
    return `focus:outline-none transition-colors flex items-center p-2 ${
      isActive
        ? 'text-primary font-bold bg-primary/15 rounded-md border-b-0 hover:bg-primary/30'
        : 'hover:text-primary hover:border-primary'
    }`
  }

  useEffect(() => {
    if (isWalletSidebarOpen && !wallet) detectWallets()
  }, [isWalletSidebarOpen])

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  // Close the menu automatically on desktop (screen width greater than 1024px (lg))
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false) // Close the menu when screen size is large enough (desktop)
      }
    }

    // Listen for resize events
    window.addEventListener('resize', handleResize)

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const walletButtonText = wallet
    ? wallet.balance.handle
      ? `${wallet.balance.handle}`
      : wallet.address
        ? `${wallet.address.slice(0, 5)}...${wallet.address.slice(-6)}`
        : `${t('header.address.loading')}...`
    : t('header.wallet.connect')

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 left-0 right-0 py-4 px-8 bg-light-navbar dark:bg-dark-navbar shadow-sm dark:shadow-primary/30 z-50 transition-all duration-200 ease-in-out">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/">
              <div className="flex flex-row text-xl items-center">
                <img src="/logos/djed.svg" alt="Open DJED" />
                Open DJED
              </div>
            </Link>
          </div>

          {/* Center links - Desktop only */}
          <div className="hidden lg:flex justify-center space-x-6 mx-10">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to}>
                <div className={getNavLinkClasses(pathname === link.to)}>{link.label}</div>
              </Link>
            ))}
          </div>

          {/* Right - Wallet & Select */}
          <div className="flex-1 hidden lg:flex justify-end items-center space-x-4">
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
            <Button onClick={() => setIsWalletSidebarOpen(true)} className="w-48">
              {walletButtonText}
            </Button>
          </div>

          {/* Menu toggle - Mobile only */}
          <div className="flex flex-row space-x-4 lg:hidden text-primary">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="focus:outline-none p-2 hover:bg-gray-100 dark:hover:bg-primary/30 rounded-md transition-colors"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Slide-out Mobile Menu */}
      <div
        className={`fixed right-0 top-18 bottom-0 w-3/4 max-w-xs bg-white dark:bg-dark-bg z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={toggleMenu}
                className={`${getNavLinkClasses(pathname === link.to)} w-full justify-start font-medium border-b border-primary/20`}
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
            <Button onClick={() => setIsWalletSidebarOpen(true)} className="w-full">
              {walletButtonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Dark background*/}
      {menuOpen && <div className="fixed inset-0 bg-dark-bg/80 z-30" onClick={toggleMenu} />}

      {/* Wallet Sidebar */}
      <Sidebar isOpen={isWalletSidebarOpen} onClose={() => setIsWalletSidebarOpen(false)}>
        {wallet ? (
          <div className="flex flex-col justify-start h-full px-4 py-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col justify-start items-start gap-4 w-full border-b border-gray-300 pb-6">
                <h1 className="font-bold">{t('wallet.details')}:</h1>
                <div className="flex flex-row justify-center items-center gap-6 w-full">
                  <span className="rounded-full w-10 h-10 overflow-hidden">
                    <img src={wallet.icon} alt="Wallet Icon" className="w-full h-full object-cover" />
                  </span>
                  <p>
                    {wallet.address
                      ? wallet.address.slice(0, 10) + '...' + wallet.address.slice(-10)
                      : t('header.address.not.detected')}
                  </p>
                  <Tooltip
                    text={t('wallet.disconnect')}
                    tooltipDirection="left"
                    children={
                      <span className="cursor-pointer" onClick={disconnect}>
                        <i className="fa-solid fa-plug-circle-xmark w-full"></i>
                      </span>
                    }
                  />
                </div>
              </div>
              <div
                className="flex flex-col justify-start items-start gap-4 w-full pb-6 border-b border-gray-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-row justify-between w-full">
                  <h1 className="font-bold">{t('header.available.balance')}:</h1>
                  <Tooltip
                    text={`${showBalance ? t('common.hide') : t('common.show')} ${t('wallet.balance')}`}
                    tooltipDirection="left"
                    children={
                      <span className="cursor-pointer" onClick={() => setShowBalance(!showBalance)}>
                        {showBalance ? <FiEyeOff /> : <FiEye />}
                      </span>
                    }
                  />
                </div>
                <div className="flex flex-row justify-between items-center gap-6 w-full font-bold">
                  <span className="rounded-full w-10 h-10 overflow-hidden">
                    <img src="/logos/cardano-ada-logo.svg" alt="ADA logo" />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.ADA}</span>
                    ) : (
                      <span className="inline-block w-32 h-4 bg-gray-300 rounded-md blur-sm mr-4" />
                    )}
                    ADA
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center gap-6 w-full font-bold">
                  <span className="rounded-full w-10 h-10 overflow-hidden">
                    <img src="/logos/djed.svg" alt="Djed logo" />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.DJED}</span>
                    ) : (
                      <span className="inline-block w-32 h-4 bg-gray-300 rounded-md blur-sm mr-4" />
                    )}
                    DJED
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center gap-6 w-full font-bold">
                  <span className="rounded-full w-10 h-10 overflow-hidden">
                    <img src="/logos/shen-logo.png" alt="Shen logo" />
                  </span>
                  <p>
                    {showBalance ? (
                      <span className="mr-4">{wallet.balance.SHEN}</span>
                    ) : (
                      <span className="inline-block w-32 h-4 bg-gray-300 rounded-md blur-sm mr-4" />
                    )}
                    SHEN
                  </p>
                </div>
              </div>
              <div
                className="flex flex-col justify-start items-start gap-4 w-full pb-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col justify-start items-start gap-4 w-full">
                  <Orders wallet={wallet} setToastProps={setToastProps} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-start h-full px-4 py-4">
            <div>
              {wallets.length === 0 ? (
                <p className="font-semibold text-red-500">{t('wallet.not.detected')}.</p>
              ) : (
                <p className="text-xl py-4 pl-5 font-semibold">{t('wallet.choose')}:</p>
              )}
            </div>
            {wallets
              .filter(({ id }) => SUPPORTED_WALLET_IDS.includes(id))
              .sort((a, b) => SUPPORTED_WALLET_IDS.indexOf(a.id) - SUPPORTED_WALLET_IDS.indexOf(b.id))
              .map(({ id, name, icon }) => (
                <div
                  className="flex flex-row gap-2 items-center justify-between p-4 rounded-lg hover:bg-primary hover:text-white pr-6"
                  key={id}
                  onClick={() => {
                    connect(id)
                  }}
                >
                  <div className="flex flex-row justify-start items-center">
                    <img src={icon} alt={`${name} icon`} className="w-12 h-12 mr-3" />
                    <span className="text-lg">{name.replace(/^\w/, (c) => c.toUpperCase())}</span>
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
