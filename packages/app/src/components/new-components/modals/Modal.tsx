"use client"

import React from "react"
import Icon from "../Icon"

type ModalProps = {
  title: string
  closeButton?: React.ReactNode
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  title,
  closeButton,
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const CloseBtn = closeButton || (
    <Icon
      name="Close"
      aria-label="Close modal"
      onClick={onClose}
      id="close-modal-button"
    />
  )

  return (
    <>
      {/* Overlay */}
      <div
        className={`bg-skrim fixed inset-0 z-40 cursor-pointer backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-80" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`bg-surface-modal border-border-primary fixed z-50 flex h-full transform flex-col overflow-hidden rounded-[8px] border p-[24px] transition-transform duration-300 ease-in-out ${className}`}
      >
        <div className="flex shrink-0 items-center justify-between pb-[24px]">
          <h2 className="text-primary leading-heading-s text-xl font-semibold">
            {title}
          </h2>
          {CloseBtn}
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  )
}

export default Modal
