import React from "react"

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ref?: React.Ref<HTMLButtonElement> | undefined
  disabled?: boolean
  dark?: boolean
  size?: "xs" | "sm" | "md" | "lg" | "full"
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  ref,
  disabled,
  size = "md",
}) => {
  const sizeClass = {
    xs: "w-13",
    sm: "w-24",
    md: "w-32",
    lg: "w-40",
    full: "w-full",
  }[size]

  return (
    <button
      className={`${sizeClass} bg-primary flex h-auto items-center justify-center font-bold text-white ${
        disabled
          ? "cursor-not-allowed opacity-30"
          : "hover:bg-primary-hover cursor-pointer"
      } rounded-lg px-4 py-2 transition-opacity ${className}`}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
