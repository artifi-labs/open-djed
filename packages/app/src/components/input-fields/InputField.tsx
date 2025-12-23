"use client"
import {
  useState,
  type ButtonHTMLAttributes,
  type FC,
  type InputHTMLAttributes,
} from "react"
import clsx from "clsx"
import type { IconName } from "../Icon"
import Icon from "../Icon"

type Size = "Small" | "Medium" | "Large"

export type BaseInputFieldProps = {
  placeholder?: string
  size: Size
  iconSize?: number
  leadingIcon?: IconName
  trailingIcon?: IconName
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">

type AtLeastOneIdOrName =
  | { id: string; name?: string }
  | { name: string; id?: string }

export type InputFieldProps = BaseInputFieldProps & AtLeastOneIdOrName

type CloseButtonProps = {
  onClick: () => void
  size: number
} & ButtonHTMLAttributes<HTMLButtonElement>

const ClearButton: FC<CloseButtonProps> = ({ onClick, size, ...props }) => {
  const className = clsx("cursor-pointer p-8", props.className)

  return (
    <button onClick={onClick} className={className} {...props}>
      <Icon name="Close" size={size} />
    </button>
  )
}

const InputField: FC<InputFieldProps> = ({
  placeholder,
  size,
  leadingIcon,
  trailingIcon,
  iconSize = 22,
  ...props
}) => {
  const [value, setValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const sizeClasses: Record<Size, { text: string; className: string }> = {
    Small: {
      text: "text-sm",
      className: "px-10 py-8 h-[40px]",
    },
    Medium: {
      text: "text-sm",
      className: "px-10 py-12 h-[44px]",
    },
    Large: {
      text: "text-md",
      className: "px-12 py-16 h-[46px]",
    },
  }

  const className = clsx(
    "w-[400px]",
    "border-border-primary border border-color-gradient-focus rounded-input-dropdown items-center flex flex-row gap-8 ",
    "bg-surface-primary hover:bg-surface-primary-hover focus-within:bg-surface-primary-focused active:bg-surface-primary-pressed",
    sizeClasses[size].className,
  )

  const textClassName = clsx(
    "text-primary placeholder:text-tertiary font-medium outline-none",
    "flex-1",
    sizeClasses[size].text,
  )

  return (
    <div className={className}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
      <input
        type="text"
        placeholder={placeholder}
        className={textClassName}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsTyping(true)}
        onBlur={() => setIsTyping(false)}
        value={value}
        {...props}
      />

      {/* Clear Input Button */}
      {(isTyping || value) && (
        <ClearButton
          onClick={() => setValue("")}
          size={14}
          id={`${props.id}-clear-button`}
          name={`${props.name}-clear-button`}
          aria-label={`Clear ${placeholder || "input"}`}
          onMouseDown={(e) => e.preventDefault()}
        />
      )}

      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </div>
  )
}

export default InputField
