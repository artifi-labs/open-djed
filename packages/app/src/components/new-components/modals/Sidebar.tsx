"use client"
import React from "react"
import Modal from "./Modal"
import clsx from "clsx"

type SidePanelProps = {
  title: string
  logo?: boolean
  headerAction?: React.ReactNode
  closeButton?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export const Sidebar: React.FC<SidePanelProps> = ({
  title,
  logo = false,
  headerAction,
  closeButton,
  isOpen,
  onClose,
  children,
  width,
}) => {
  return (
    <Modal
      title={title}
      logo={logo}
      headerAction={headerAction}
      closeButton={closeButton}
      isOpen={isOpen}
      onClose={onClose}
      className={clsx(
        "rounded-l-8 ml-auto h-full max-h-full rounded-none sm:h-full sm:max-h-full",
        "transform transition-transform duration-300 ease-in-out",
        width ?? "w-full sm:w-[350px] lg:w-[460px]",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      {children}
    </Modal>
  )
}

export default Sidebar
