"use client"

import React from "react"
import { Modal } from "./Modal"
import { clsx } from "clsx"

type SidePanelProps = {
  title: string
  closeButton?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export const Sidebar: React.FC<SidePanelProps> = ({
  title,
  closeButton,
  isOpen,
  onClose,
  children,
  width,
}) => {
  const className = clsx(
    "right-0 top-0 h-full rounded-br-none rounded-tr-none",
    width || "w-full sm:w-[350px] lg:w-[460px]",
    isOpen ? "translate-x-0" : "translate-x-full",
  )

  return (
    <Modal
      title={title}
      closeButton={closeButton}
      isOpen={isOpen}
      onClose={onClose}
      className={className}
    >
      {children}
    </Modal>
  )
}

export default Sidebar
