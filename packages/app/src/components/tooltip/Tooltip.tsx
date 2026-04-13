"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"
import "./tooltip.css"

type TooltipProps = {
  text: string
  tooltipDirection?: "top" | "bottom" | "left" | "right"
  style?: React.CSSProperties
  tooltipModalClass?: string
  children?: React.ReactNode
}

const Tooltip = ({
  text,
  tooltipDirection = "top",
  style,
  tooltipModalClass,
  children,
}: TooltipProps) => {
  const [direction, setDirection] = useState(tooltipDirection)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalRoot(document.getElementById("tooltip-root"))
  }, [])

  const autoDetectDirection = useCallback(() => {
    if (!wrapperRef.current || !tooltipRef.current) return

    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const margin = 8

    const fitsTop = wrapperRect.top >= tooltipRect.height + margin
    const fitsBottom =
      window.innerHeight - wrapperRect.bottom >= tooltipRect.height + margin
    const fitsLeft = wrapperRect.left >= tooltipRect.width + margin
    const fitsRight =
      window.innerWidth - wrapperRect.right >= tooltipRect.width + margin

    if (tooltipDirection === "top" && fitsTop) return setDirection("top")
    if (tooltipDirection === "bottom" && fitsBottom)
      return setDirection("bottom")
    if (tooltipDirection === "left" && fitsLeft) return setDirection("left")
    if (tooltipDirection === "right" && fitsRight) return setDirection("right")

    if (fitsTop) return setDirection("top")
    if (fitsBottom) return setDirection("bottom")
    if (fitsLeft) return setDirection("left")
    if (fitsRight) return setDirection("right")
  }, [tooltipDirection])

  const updatePosition = useCallback(() => {
    if (!wrapperRef.current || !tooltipRef.current) return

    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const margin = 8
    const padding = 8

    let top = 0
    let left = 0

    switch (direction) {
      case "top":
        top = wrapperRect.top - tooltipRect.height - margin
        left = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2
        break

      case "bottom":
        top = wrapperRect.bottom + margin
        left = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2
        break

      case "left":
        top = wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2
        left = wrapperRect.left - tooltipRect.width - margin
        break

      case "right":
        top = wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2
        left = wrapperRect.right + margin
        break
    }

    if (left < padding) {
      left = padding
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding
    }

    if (top < padding) {
      top = padding
    } else if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding
    }

    setPosition({ top: Math.max(0, top), left: Math.max(0, left) })
  }, [direction])

  useLayoutEffect(() => {
    if (!visible) return

    autoDetectDirection()
    updatePosition()
  }, [visible, direction, autoDetectDirection, updatePosition])

  useEffect(() => {
    if (!visible) return

    const handle = () => {
      autoDetectDirection()
      updatePosition()
    }

    window.addEventListener("resize", handle)
    window.addEventListener("scroll", handle)

    return () => {
      window.removeEventListener("resize", handle)
      window.removeEventListener("scroll", handle)
    }
  }, [visible, autoDetectDirection, updatePosition])

  const tooltipClass = clsx({
    "tooltip-top": direction === "top",
    "tooltip-bottom": direction === "bottom",
    "tooltip-left": direction === "left",
    "tooltip-right": direction === "right",
  })

  const tooltipModalStyle = clsx(
    "tooltip-content",
    visible && "visible",
    tooltipModalClass,
  )
  return (
    <div
      className={tooltipClass}
      style={style}
      ref={wrapperRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible &&
        portalRoot &&
        createPortal(
          <div
            ref={tooltipRef}
            className={tooltipModalStyle}
            style={{
              position: "absolute",
              top: position.top + window.scrollY,
              left: position.left + window.scrollX,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <div className="bg-lilac-900 text-primary wrap-break-words w-max max-w-79 rounded-lg border border-neutral-800 p-3 text-left text-xs font-normal">
              {text}
            </div>
          </div>,
          portalRoot,
        )}

      {children ?? <i className="fa-solid fa-circle-info" />}
    </div>
  )
}

export default Tooltip
