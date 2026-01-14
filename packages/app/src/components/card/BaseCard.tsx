import * as React from "react"
import clsx from "clsx"

export type BaseCardProps = {
  padding?: string
  border?: string
  backgroundColor?: string
  children?: React.ReactNode
  overlay?: boolean
  overlayContent?: React.JSX.Element
} & React.HTMLAttributes<HTMLDivElement>

const BaseCard: React.FC<BaseCardProps> = ({
  padding = "desktop:p-24 p-16",
  backgroundColor = "bg-surface-card",
  border = "border-gradient border-color-gradient",
  className,
  children,
  overlay = false,
  overlayContent,
  ...props
}) => {
  const baseCardClassNames = clsx(
    "flex flex-1 flex-col rounded-card",
    border,
    backgroundColor,
    padding,
    className,
  )

  return (
    <div className={baseCardClassNames} {...props}>
      {/* Card Content */}
      <div
        className={clsx(
          "relative flex h-full flex-col",
          overlay && "opacity-80 blur-[2px] transition-all duration-300",
        )}
      >
        {children}
      </div>

      {/* Overlay content - Blur Effect */}
      {overlay && (
        <div className="absolute inset-0.5 z-20 flex items-center justify-center overflow-hidden rounded-2xl backdrop-blur-[3px]">
          <div className="bg-card-blur absolute inset-0" />
          <div className="relative z-10">{overlayContent}</div>
        </div>
      )}
    </div>
  )
}

export default BaseCard
