"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import clsx from "clsx"
import ToastItem from "@/components/ToastItem"
import { useViewport } from "@/hooks/useViewport"

type ToastType = "success" | "attention" | "error"

type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: () => void
  actionText?: string
}

type ToastContainerProps = {
  toasts: Toast[]
  closeToast: (id: string) => void
}

type ToastContextType = {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  closeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  closeToast,
}) => {
  const { isMobile } = useViewport()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div
      className={clsx(
        "fixed right-12 z-9999 flex flex-col items-end space-y-3",
        isMobile ? "top-12" : "bottom-12",
      )}
    >
      {toasts.map((toast) => (
        <ToastItem
          text={toast.message}
          key={toast.id}
          type={toast.type}
          closeIcon={true}
          leadingIcon={toast.type === "success" ? "Checkmark" : "Information"}
          action={false}
          onCloseClick={() => closeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      setToasts((prev) => {
        const alreadyExists = prev.some((t) => t.message === toast.message)

        if (alreadyExists) return prev

        const id = crypto.randomUUID()
        const duration = toast.duration ?? 4000

        setTimeout(() => closeToast(id), duration)

        return [...prev, { ...toast, id }]
      })
    },
    [closeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, closeToast }}>
      {children}
      <ToastContainer toasts={toasts} closeToast={closeToast} />
    </ToastContext.Provider>
  )
}
