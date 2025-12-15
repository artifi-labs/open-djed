import * as React from "react"
import clsx from "clsx"

export type BaseCardProps = {
  padding?: string
  backgroundColor?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

const BaseCard: React.FC<BaseCardProps> = ({
  padding = "p-[24px]",
  backgroundColor = "bg-surface-card",
  className,
  children,
  ...props
}) => {

  const baseCardClassNames = clsx(
    "border-gradient border-color-gradient flex w-full flex-1 flex-col rounded-card",
    backgroundColor,
    padding,
    className,
  )

  return (
    <div
      className={baseCardClassNames}
      {...props}
    >
      {children}
    </div>
  )
}

export default BaseCard
