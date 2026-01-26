"use client"

import Divider from "../Divider"
import ListItem from "../ListItem"
import Link from "next/link"
import type { WalletName } from "../Wallet"
import { capitalizeLower } from "@/lib/utils"

export type WalletMetadata = {
  id: string
  name: string
  icon: string
}

export type SelectWalletSectionProps = {
  wallets: WalletMetadata[]
  onClick: (walletId: string) => void
}

const isValidCoinName = (name: string): name is WalletName => {
  return (name as WalletName) !== undefined
}

const SelectWalletSection: React.FC<SelectWalletSectionProps> = ({
  wallets,
  onClick,
}) => {
  return (
    <div className="desktop:gap-24 flex h-full flex-col gap-16">
      <div className="flex flex-1 flex-col overflow-y-auto py-8">
        {wallets?.map((wallet, index) => (
          <ListItem
            key={`${wallet.name}-${wallet.id}`}
            divider={index < wallets.length - 1}
            text={capitalizeLower(wallet.name)}
            onClick={() => onClick(wallet.id)}
            wallet={
              isValidCoinName(wallet.name)
                ? (wallet.name.toUpperCase() as WalletName)
                : "PLACEHOLDER"
            }
            icon="Arrow-Right"
            className="cursor-pointer"
          />
        ))}
      </div>

      <Divider orientation="horizontal" />
      <div className="flex flex-col text-center">
        <p className="text-secondary self-stretch text-xs">
          By connecting you agree to our{" "}
          <Link href="/terms" className="text-link underline">
            Terms & Services
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-link underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SelectWalletSection
