"use client"
import React from "react"
import Modal from "./Modal"
import clsx from "clsx"
import ButtonIcon from "../ButtonIcon"
import { type IconName } from "../icons/index"

type SidePanelProps = {
  title: string
  logo?: boolean
  titleClassName?: string
  hasLeadingIcon?: IconName
  headerAction?: React.ReactNode
  closeButton?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  children: React.ReactNode
  width?: string
  paddingClassName?: string
  headerClassName?: string
}

export const Sidebar: React.FC<SidePanelProps> = ({
  title,
  logo = false,
  titleClassName,
  hasLeadingIcon,
  headerAction,
  closeButton,
  isOpen,
  onClose,
  onBack,
  children,
  width,
  paddingClassName,
  headerClassName,
}) => {
  const baseHeaderAction = headerAction ?? (
    <ButtonIcon
      icon="Close"
      size="medium"
      variant="onlyIcon"
      name="Close-Sidebar"
      aria-label="Close sidebar"
      onClick={onClose}
    />
  )

  return (
    <Modal
      title={title}
      logo={logo}
      titleClassName={titleClassName}
      hasLeadingIcon={hasLeadingIcon}
      headerAction={baseHeaderAction}
      closeButton={closeButton}
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      paddingClassName={paddingClassName}
      headerClassName={headerClassName}
      className={clsx(
        "rounded-l-8 ml-auto h-full max-h-full rounded-none sm:h-full sm:max-h-full",
        "transform transition-transform duration-300 ease-in-out",
        width ?? "w-full sm:w-[350px] lg:w-[460px]",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
      border="border-gradient border-color-primary"
      hasCloseButton={false}
    >
      {children}
    </Modal>
  )
}

export default Sidebar
