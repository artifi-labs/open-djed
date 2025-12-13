import * as React from "react"
import clsx from "clsx"

export type DividerProps = {
  orientation?: Orientation
  dashed?: boolean
  className?: string
  flexItem?: boolean
} & React.HTMLAttributes<HTMLElement>

type Orientation = "horizontal" | "vertical"

const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  dashed = false,
  className,
  flexItem = true,
  ...props
}) => {
  const baseClasses = "border-border-secondary"

  const orientationClasses: Record<Orientation, string> = {
    horizontal: "border-t w-auto",
    vertical: "border-l h-auto",
  }

  const classes = clsx(
    baseClasses,
    orientationClasses[orientation],
    dashed && "border-dashed",
    flexItem && "self-stretch",
    className,
  )

  if (orientation === "horizontal") {
    return <hr className={classes} {...props} />
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={classes}
      {...props}
    />
  )
}

export default Divider
