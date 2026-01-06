"use client"
import React from "react"
import Logo from "../Logo"
import clsx from "clsx"
import Skrim from "../Skrim"
import ButtonIcon from "../ButtonIcon"

type ModalProps = {
  title: string
  logo?: boolean
  hasCloseButton?: boolean
  closeButton?: React.ReactNode
  headerAction?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  overlayClassName?: string
  border?: string
}

export const Modal: React.FC<ModalProps> = ({
  title,
  logo = false,
  headerAction,
  hasCloseButton = true,
  closeButton,
  isOpen,
  onClose,
  children,
  className,
  border = "border-gradient border-color-gradient",
}) => {
  if (!isOpen) return null

  const CloseBtn = closeButton ?? (
    <ButtonIcon
      icon="Close"
      size="medium"
      variant="onlyIcon"
      name="Close-Modal"
      aria-label="Close modal"
      onClick={onClose}
    />
  )

  const baseClassName = clsx(
    "bg-surface-secondary rounded-8 relative flex max-h-[85vh] max-w-full min-w-xs flex-col overflow-hidden desktop:p-42 p-32 sm:max-h-[85vh] sm:max-w-200",
    border,
    className,
  )

  return (
    <>
      {/* Overlay */}
      {isOpen && <Skrim />}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className={baseClassName} onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-10 flex items-center justify-between pb-16">
            {logo ? (
              <Logo />
            ) : (
              <h2 className="text-primary font-bold">{title}</h2>
            )}
            {headerAction && <>{headerAction}</>}
          </div>

          {hasCloseButton && (
            <div className="absolute top-16 right-16 z-20">{CloseBtn}</div>
          )}

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  )
}

export default Modal
