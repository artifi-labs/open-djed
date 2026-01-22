"use client"
import React from "react"
import Logo from "../Logo"
import clsx from "clsx"
import Skrim from "../Skrim"
import ButtonIcon from "../ButtonIcon"
import { type IconName } from "../icons/index"

type ModalProps = {
  title: string
  logo?: boolean
  titleClassName?: string
  hasLeadingIcon?: IconName
  hasCloseButton?: boolean
  closeButton?: React.ReactNode
  headerAction?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  children: React.ReactNode
  className?: string
  overlayClassName?: string
  border?: string
}

export const Modal: React.FC<ModalProps> = ({
  title,
  logo = false,
  titleClassName,
  hasLeadingIcon,
  headerAction,
  hasCloseButton = true,
  closeButton,
  isOpen,
  onClose,
  onBack,
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
    "bg-surface-modal rounded-8 relative flex max-h-[85vh] max-w-full min-w-xs flex-col overflow-hidden desktop:p-24 p-16 sm:max-h-[85vh] sm:max-w-200",
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
          <div className="sticky top-0 z-10 flex items-center justify-between pb-12">
            {logo ? (
              <Logo />
            ) : (
              <div className="flex items-center gap-4">
                {hasLeadingIcon && (
                  <ButtonIcon
                    icon={hasLeadingIcon}
                    variant="onlyIcon"
                    name="Back-Button"
                    aria-label="Back Button"
                    onClick={onBack ?? onClose}
                  />
                )}
                <h3
                  className={clsx("text-primary font-semibold", titleClassName)}
                >
                  {title}
                </h3>
              </div>
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
