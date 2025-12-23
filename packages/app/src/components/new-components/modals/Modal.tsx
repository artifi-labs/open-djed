"use client"

import React from "react"
import Icon from "../Icon"
import Logo from "../Logo"

type ModalProps = {
  title: string
  logo?: boolean
  closeButton?: React.ReactNode
  headerAction?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  title,
  logo = false,
  headerAction,
  closeButton,
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  if (!isOpen) return null

  const CloseBtn = closeButton || (
    <Icon
      name="Close"
      aria-label="Close modal"
      onClick={onClose}
      className="cursor-pointer"
    />
  )

  return (
    <>
      {/* Overlay */}
      <div
        className="bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`bg-surface-secondary border-gradient border-color-gradient rounded-8 flex, sm:max-h-[85vh], relative max-h-[85vh] max-w-full min-w-xs flex-col overflow-auto p-42 sm:max-w-200 ${className} `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between pb-16">
            {logo ? (
              <Logo />
            ) : (
              <h2 className="text-primary font-bold">{title}</h2>
            )}

            {headerAction && <div className="mr-32">{headerAction}</div>}
          </div>

          {/* Close button */}
          <div className="absolute top-16 right-16 z-20">{CloseBtn}</div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children} </div>
        </div>
      </div>
    </>
  )
}

export default Modal
