import * as React from "react"
import clsx from "clsx"

export interface PageLinkProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export default function PageLink({
  className,
  active,
  disabled,
  children,
  ...props
}: PageLinkProps) {
  const classes = clsx(
    "relative inline-flex items-center justify-center px-12 py-8 text-xs transition-colors select-none rounded-lg",
    "text-primary hover:bg-background-primary-hover",

    {
      // Active state
      "bg-brand-primary": active,

      // Disabled state
      "cursor-not-allowed pointer-events-none": disabled,

      // Ellipsis
      "hover:bg-background-primary":
        disabled &&
        !active &&
        typeof children === "string" &&
        children.includes("..."),
    },
    className,
  )

  if (disabled) {
    return <span className={classes}>{children}</span>
  }

  return (
    <div
      className={classes}
      aria-current={active ? "page" : undefined}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}
