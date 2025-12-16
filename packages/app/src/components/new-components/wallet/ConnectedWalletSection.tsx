import * as React from "react"
import { type Wallet } from "@/context/WalletContext"
import Button from "../Button"
import Link from "next/link"
import { useWalletSidebar } from "@/context/SidebarContext"
import WalletDetail from "./WalletDetail"
import type { WalletName } from "../Wallet"
import WalletBalance from "./WalletBalance"
import Divider from "../Divider"

interface ConnectedWalletSectionProps {
  wallet: Wallet
  disconnect: () => void
}

const ConnectedWalletSection: React.FC<ConnectedWalletSectionProps> = ({
  wallet,
  disconnect,
}) => {
  const { closeWalletSidebar } = useWalletSidebar()

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-5">
        <WalletDetail
          balance={wallet.balance}
          name={wallet.name.toUpperCase() as WalletName}
          address={wallet.address ? wallet.address : ""}
          onDisconnect={disconnect}
        />
        <div className="flex w-full flex-row items-start justify-start gap-8 overflow-x-auto">
          <WalletBalance token="DJED" amount={wallet.balance.DJED} />
          <WalletBalance token="SHEN" amount={wallet.balance.SHEN} />
          <WalletBalance token="ADA" amount={wallet.balance.ADA} />
        </div>
        <Link href={"/"}>
          <Button
            className="w-full"
            variant="primary"
            onClick={() => closeWalletSidebar()}
            text="Mint & Burn Now"
          />
        </Link>
        <Divider />
      </div>
    </div>
  )
}

export default ConnectedWalletSection
