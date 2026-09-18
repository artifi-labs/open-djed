"use client"

import { useTranslations } from "next-intl"
import Button from "@/components/Button"
import BaseCard from "@/components/card/BaseCard"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import { useRewards, REWARDS_PER_PAGE } from "@/hooks/rewards/useRewards"
import RewardsStats from "./RewardsStats"
import RewardsTable from "./RewardsTable"

const Rewards = () => {
  const t = useTranslations()
  const { wallet } = useWallet()
  const { openWalletSidebar } = useSidebar()

  const {
    epochs,
    totalDistributed,
    totalPending,
    currentEpoch,
    totalCount,
    totalPages,
    page,
    setPage,
    statsLoading,
    tableLoading,
  } = useRewards()

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      <div className="desktop:gap-6 flex flex-col gap-4 pb-16">
        <h1 className="text-h2 font-bold">{t("rewards.title")}</h1>
        <span className="text-secondary text-sm">{t("rewards.subtitle")}</span>
      </div>

      <div className="flex flex-1 flex-col gap-24">
        {!wallet ? (
          <BaseCard
            border="border-gradient border-color-primary"
            className="justify-center p-16"
          >
            <div className="flex flex-col items-center justify-center gap-24 text-center">
              <p className="text-lg font-semibold">{t("rewards.noWallet")}</p>
              <Button
                text={t("wallet.connectWallet")}
                variant="accent"
                size="small"
                onClick={() => openWalletSidebar()}
              />
            </div>
          </BaseCard>
        ) : (
          <>
            <RewardsStats
              currentEpoch={currentEpoch}
              totalDistributed={totalDistributed}
              totalPending={totalPending}
              loading={statsLoading}
            />
            <RewardsTable
              epochs={epochs}
              loading={tableLoading}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              rowsPerPage={REWARDS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Rewards
