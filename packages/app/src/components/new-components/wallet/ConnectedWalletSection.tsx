import * as React from "react"
import { type Wallet } from "@/context/WalletContext"
import Button from "../Button"
import Icon from "../Icon"
import Link from "next/link"
import { useWalletSidebar } from "@/context/SidebarContext"
import WalletDetail from "./WalletDetail"
import { WalletName } from "../Wallet"

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
    <div className="flex h-full w-full flex-col gap-5">
      <div className="flex shrink-0 flex-col gap-5">
        <WalletDetail
          balance={wallet.balance}
          name={wallet.name.toUpperCase() as WalletName}
          address={wallet.address ? wallet.address : ""}
          onDisconnect={disconnect}
        />
        <Link href={"/"}>
          <Button
            className="w-full"
            variant="primary"
            onClick={() => closeWalletSidebar()}
            text="Mint & Burn Now"
          />
        </Link>
      </div>
    </div>
  )
}

export default ConnectedWalletSection
