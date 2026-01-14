"use client"

import * as React from "react"
import clsx from "clsx"
import ContextualMenu, { type ContextualMenuItem } from "./ContextualMenu"
import { type IconName } from "./icons/index"
import ButtonIcon from "./ButtonIcon"

type Size = "small" | "medium" | "large"

export type DropdownButtonProps = {
  leadingIcon?: IconName
  text: string
  size?: Size
  menuItems: ContextualMenuItem[]
  defaultItem?: ContextualMenuItem
  activeItem?: ContextualMenuItem
  menuWidth?: string
  onChange?: (item: ContextualMenuItem) => void
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  size = "large",
  text,
  menuItems,
  menuWidth,
  activeItem,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleItemClick = (item: ContextualMenuItem) => {
    setIsOpen(false)
    onChange?.(item)
  }

  const sizeClasses: Record<Size, string> = {
    small: "text-sm",
    medium: "text-sm",
    large: "text-md",
  }

  const baseClasses = clsx(
    "inline-flex items-center",
    "rounded-input-dropdown text-primary",
  )

  const dropdownClasses = clsx(baseClasses, sizeClasses[size], "cursor-pointer")

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        ref={buttonRef}
        className={clsx(dropdownClasses, "inline-flex items-center gap-2")}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        type="button"
      >
        <span className="text-primary text-md font-medium">{text}</span>

        <ButtonIcon
          icon="Chevron-down"
          variant="onlyIcon"
          size="small"
          hasButton={false}
          className={clsx(
            "transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          active={isOpen}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-8"
          onClick={(e) => e.stopPropagation()}
        >
          <ContextualMenu
            items={menuItems}
            onClick={handleItemClick}
            activeItem={activeItem}
            width={menuWidth}
          />
        </div>
      )}
    </div>
  )
}

export default DropdownButton
