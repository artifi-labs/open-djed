"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

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

    if (tooltipDirection === "top" && fitsTop && direction !== "top") {
      return setDirection("top")
    }
    if (tooltipDirection === "bottom" && fitsBottom && direction !== "bottom") {
      return setDirection("bottom")
    }
    if (tooltipDirection === "left" && fitsLeft && direction !== "left") {
      return setDirection("left")
    }
    if (tooltipDirection === "right" && fitsRight && direction !== "right") {
      return setDirection("right")
    }

    if (direction === "top" && !fitsTop) {
      if (fitsBottom) return setDirection("bottom")
      if (fitsLeft) return setDirection("left")
      if (fitsRight) return setDirection("right")
    }

    if (direction === "bottom" && !fitsBottom) {
      if (fitsTop) return setDirection("top")
      if (fitsLeft) return setDirection("left")
      if (fitsRight) return setDirection("right")
    }

    if (direction === "left" && !fitsLeft) {
      if (fitsRight) return setDirection("right")
      if (fitsTop) return setDirection("top")
      if (fitsBottom) return setDirection("bottom")
    }

    if (direction === "right" && !fitsRight) {
      if (fitsLeft) return setDirection("left")
      if (fitsTop) return setDirection("top")
      if (fitsBottom) return setDirection("bottom")
    }
  }, [direction, tooltipDirection])

  useEffect(() => {
    requestAnimationFrame(() => {
      autoDetectDirection()
    })

    window.addEventListener("resize", autoDetectDirection)
    return () => window.removeEventListener("resize", autoDetectDirection)
  }, [autoDetectDirection])

  const tooltipClass = clsx("tooltip", {
    "tooltip-top": direction === "top",
    "tooltip-bottom": direction === "bottom",
    "tooltip-left": direction === "left",
    "tooltip-right": direction === "right",
  })

  const tooltipModalStyle = `tooltip-content ${tooltipModalClass}`.trim()

  return (
    <div className={tooltipClass} style={style} ref={wrapperRef}>
      <div className={tooltipModalStyle} ref={tooltipRef}>
        <div className="bg-lilac-900 text-primary wrap-break-words rounded-lg border border-neutral-800 p-3 text-left text-sm">
          {text}
        </div>
      </div>
      {children ?? <i className="fa-solid fa-circle-info" />}
    </div>
  )
}

export default Tooltip
