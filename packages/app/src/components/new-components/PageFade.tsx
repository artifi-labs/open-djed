"use client"

import React, { CSSProperties, useEffect, useState } from "react"

interface PageFadeProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

export default function PageFade({
  children,
  className = "",
  duration = 450,
}: PageFadeProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const style: CSSProperties = {
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(6px)",
  }

  return (
    <div
      style={style}
      className={`flex h-full w-full flex-1 flex-col ${className}`}
    >
      {children}
    </div>
  )
}
