"use client"

import * as React from "react"
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useInteractions,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react"
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
  const [isOpen, setIsOpen] = React.useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: tooltipDirection as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: "start" }),
      shift({ padding: 8 }),
    ],
  })

  const hover = useHover(context, { move: false })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={clsx("items-center justify-center", style && "")}
      >
        {children ?? <i className="fa-solid fa-circle-info" />}
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="pointer-events-none z-9999"
          >
            <div
              className={clsx(
                "bg-lilac-900 text-primary w-max max-w-79 rounded-lg border border-neutral-800 p-3 text-left text-xs font-normal wrap-break-word shadow-xl",
                tooltipModalClass,
              )}
            >
              {text}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export default Tooltip
