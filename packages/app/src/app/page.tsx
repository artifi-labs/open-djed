"use client"

import Actions from "@/components/dashboard/Actions"
import TransactionSummary from "@/components/dashboard/TransactionSummary"
import { useMintBurnAction } from "@/components/dashboard/useMintBurnAction"
import React, { useState } from "react"
import Button from "@/components/Button"
import ReserveDetails from "@/components/ReserveDetails"
import Modal from "@/components/modals/Modal"
import OpenDjedContent from "@/components/OpenDjedContent"

export default function DashboardPage() {
  const action: ReturnType<typeof useMintBurnAction> = useMintBurnAction("Mint")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto w-full max-w-280 pt-16 pb-16">
      {/* Header */}
      <div className="desktop:flex-row flex flex-col justify-between gap-12">
        <div className="flex items-center gap-6">
          <h1 className="font-bold">Open DJED</h1>
          <span className="text-secondary text-xs">Stablecoin</span>
        </div>
        <div>
          <Button
            variant="text"
            size="medium"
            text="What is Open DJED?"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="What is Open DJED?"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <OpenDjedContent />
      </Modal>

      {/* Content */}
      <div className="desktop:grid-cols-2 desktop:gap-24 desktop:pt-32 grid grid-cols-1 gap-16 pt-16">
        <Actions action={action} onActionChange={action.onActionChange} />
        <TransactionSummary action={action} />
      </div>

      <ReserveDetails />
    </div>
  )
}
