"use client"

import * as React from "react"
import clsx from "clsx"
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  FloatingPortal,
} from "@floating-ui/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import ButtonIcon from "@/components/ButtonIcon"
import Tooltip from "@/components/tooltip/Tooltip"
import ContextualMenu, {
  type ContextualMenuItem,
} from "@/components/ContextualMenu"
import { CARDANOSCAN_BASE_URL } from "@/lib/constants"
import type { RewardEpoch } from "@/queries/rewards/rewards.schema"

const txUrl = (hash: string) => `${CARDANOSCAN_BASE_URL}/transaction/${hash}`

const TxLink = ({ hash, label }: { hash: string; label: string }) => (
  <Tooltip text={label}>
    <Link href={txUrl(hash)} target="_blank" aria-label={label}>
      <ButtonIcon size="tiny" variant="outlined" icon="External" />
    </Link>
  </Tooltip>
)

const TxMenu = ({
  rewardTxHash,
  airDropTxHash,
  rewardLabel,
  airdropLabel,
}: {
  rewardTxHash: string
  airDropTxHash: string
  rewardLabel: string
  airdropLabel: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  React.useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        !refs.domReference.current?.contains(target) &&
        !refs.floating.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, refs])

  const menuItems: ContextualMenuItem[] = [
    { key: "reward", text: rewardLabel },
    { key: "airdrop", text: airdropLabel },
  ]

  const handleItemClick = (item: ContextualMenuItem) => {
    setIsOpen(false)
    const hash = item.key === "reward" ? rewardTxHash : airDropTxHash
    window.open(txUrl(hash), "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ButtonIcon
          size="tiny"
          variant="outlined"
          icon="ElipsisVertical"
          hasButton={false}
        />
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-9999"
            onClick={(e) => e.stopPropagation()}
          >
            <ContextualMenu items={menuItems} onClick={handleItemClick} />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

/** Cardanoscan links for an epoch's reward and airdrop transactions. */
const RewardTxLinks = ({
  epoch,
  className,
}: {
  epoch: Pick<RewardEpoch, "rewardTxHash" | "airDropTxHash">
  className?: string
}) => {
  const t = useTranslations()
  const { rewardTxHash, airDropTxHash } = epoch

  if (!rewardTxHash && !airDropTxHash) return null

  return (
    <div
      className={clsx("flex items-center gap-8", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {rewardTxHash && airDropTxHash ? (
        <TxMenu
          rewardTxHash={rewardTxHash}
          airDropTxHash={airDropTxHash}
          rewardLabel={t("rewards.table.rewardTx")}
          airdropLabel={t("rewards.table.airdropTx")}
        />
      ) : (
        <TxLink
          hash={(rewardTxHash ?? airDropTxHash) as string}
          label={t(
            rewardTxHash ? "rewards.table.rewardTx" : "rewards.table.airdropTx",
          )}
        />
      )}
    </div>
  )
}

export default RewardTxLinks
