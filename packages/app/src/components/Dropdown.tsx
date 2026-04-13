"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"
import ContextualMenu, { type ContextualMenuItem } from "./ContextualMenu"
import Icon, { type IconName } from "./icons/Icon"
import Tag from "./Tag"

type Size = "small" | "medium" | "large"

export type DropdownProps = {
  leadingIcon?: IconName
  text?: string
  hasTag?: boolean
  tagLeadingIcon?: IconName
  tagTrailingIcon?: IconName
  suffix?: string
  trailingIcon?: IconName
  size?: Size
  menuItems: ContextualMenuItem[]
  defaultItem?: ContextualMenuItem
  onChange?: (item: ContextualMenuItem) => void
  renderMenu?: (close: () => void) => React.ReactNode
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
  renderMenu,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [itemSelected, setItemSelected] =
    React.useState<ContextualMenuItem | null>(defaultItem || null)

  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => setMounted(true), [])

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

  const updatePosition = () => {
    if (!dropdownRef.current) return

    const rect = dropdownRef.current.getBoundingClientRect()

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    })
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isOpen) {
      updatePosition()
    }

    setIsOpen((prev) => !prev)
  }

  const handleItemClick = (item: ContextualMenuItem) => {
    setItemSelected(item)
    setIsOpen(false)
    onChange?.(item)
  }

  const close = () => setIsOpen(false)

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
    isOpen && "border-color-gradient",
  )

  const dropdownClasses = clsx(
    baseClasses,
    sizeClasses[size],
    interactiveClasses,
    "group cursor-pointer",
  )

  const currentItem = itemSelected ?? defaultItem ?? null
  const displayIcon = currentItem?.icon || leadingIcon

  const menuContent = renderMenu?.(close) ?? (
    <ContextualMenu items={menuItems} onClick={handleItemClick} />
  )

  return (
    <>
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
              <span className="text-tertiary text-xxs font-medium">
                {suffix}
              </span>
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
      </div>

      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="absolute z-50"
            style={{
              top: position.top,
              left: position.left,
              minWidth: dropdownRef.current?.offsetWidth,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuContent}
          </div>,
          document.body,
        )}
    </>
  )
}

export default Dropdown
