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
  headerClassName?: string
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  children: React.ReactNode
  className?: string
  paddingClassName?: string
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
  headerClassName,
  isOpen,
  onClose,
  onBack,
  children,
  className,
  paddingClassName = "desktop:p-24 p-16",
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
    "bg-surface-modal rounded-8 relative flex max-h-[85vh] max-w-full min-w-xs flex-col overflow-hidden sm:max-h-[85vh] sm:max-w-200",
    border,
    className,
  )
  const contentClasses = clsx("flex-1 overflow-y-auto", paddingClassName)

  return (
    <>
      {/* Overlay */}
      {isOpen && <Skrim />}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className={baseClassName} onClick={(e) => e.stopPropagation()}>
          <div
            className={clsx(
              "sticky top-0 z-10 flex items-center justify-between",
              headerClassName,
            )}
          >
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

          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </>
  )
}

export default Modal
