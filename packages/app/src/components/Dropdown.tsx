"use client"

import * as React from "react"
import clsx from "clsx"
import ContextualMenu, { type ContextualMenuItem } from "./ContextualMenu"
import Icon, { type IconName } from "./Icon"
import Tag from "./Tag"

type Size = "small" | "medium" | "large"

export type DropdownProps = {
  leadingIcon?: IconName
  text: string
  hasTag?: boolean
  tagLeadingIcon?: IconName
  tagTrailingIcon?: IconName
  suffix?: string
  trailingIcon?: IconName
  size?: Size
  menuItems: ContextualMenuItem[]
  defaultItem?: ContextualMenuItem
  onChange?: (item: ContextualMenuItem) => void
}

const Dropdown: React.FC<DropdownProps> = ({
  size = "large",
  leadingIcon,
  text,
  hasTag = true,
  tagLeadingIcon,
  tagTrailingIcon,
  suffix,
  trailingIcon,
  menuItems,
  defaultItem,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [itemSelected, setItemSelected] =
    React.useState<ContextualMenuItem | null>(defaultItem || null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleItemClick = (item: ContextualMenuItem) => {
    setItemSelected(item)
    setIsOpen(false)
    onChange?.(item)
  }

  const sizeClasses: Record<Size, string> = {
    small: "px-10 py-8 text-sm",
    medium: "px-10 py-12 text-sm",
    large: "px-12 py-16 text-md",
  }

  const baseClasses = clsx(
    "border-gradient border-color-primary bg-surface-primary",
    "inline-flex w-full items-center justify-between rounded-input-dropdown text-primary",
  )

  const interactiveClasses = clsx(
    "hover:bg-surface-primary-hover focus:bg-surface-primary-focused active:bg-surface-primary-pressed",
    "border-color-gradient-hover border-color-gradient-focus",
    {
      "border-color-gradient": isOpen, // To keeps the gradient active while the menu is open
    },
  )

  const dropdownClasses = clsx(
    baseClasses,
    sizeClasses[size],
    interactiveClasses,
    "group cursor-pointer",
  )

  const currentItem: ContextualMenuItem | null =
    itemSelected ?? defaultItem ?? null

  const displayIcon = currentItem?.icon || leadingIcon

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        className={dropdownClasses}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        type="button"
      >
        <div className="inline-flex items-center gap-8">
          {displayIcon && <Icon name={displayIcon} />}

          <span className="text-tertiary group-hover:text-primary font-medium">
            {currentItem?.text || text}
          </span>
        </div>

        <div className="inline-flex items-center gap-8">
          {hasTag && (
            <Tag
              type="surface"
              role="Primary"
              size="tiny"
              text="Tag"
              leadingIcon={tagLeadingIcon}
              trailingIcon={tagTrailingIcon}
            />
          )}

          {suffix && (
            <span className="text-tertiary text-xxs font-medium">{suffix}</span>
          )}

          {trailingIcon && (
            <Icon
              name={trailingIcon}
              className={clsx("transition-transform duration-200", {
                "rotate-180": isOpen,
              })}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 left-0 z-10 mt-8"
          onClick={(e) => e.stopPropagation()}
        >
          <ContextualMenu items={menuItems} onClick={handleItemClick} />
        </div>
      )}
    </div>
  )
}

export default Dropdown
