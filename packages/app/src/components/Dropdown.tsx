"use client"

import * as React from "react"
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  FloatingPortal,
} from "@floating-ui/react"
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
  size: dropdownSize = "large",
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

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          })
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  React.useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        !refs.domReference.current?.contains(target) &&
        !refs.floating.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen, refs])

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
    isOpen && "border-color-gradient", // To keeps the gradient active while the menu is open
  )

  const dropdownClasses = clsx(
    baseClasses,
    sizeClasses[dropdownSize],
    interactiveClasses,
    "group cursor-pointer",
  )

  const currentItem: ContextualMenuItem | null =
    itemSelected ?? defaultItem ?? null

  const displayIcon = currentItem?.icon || leadingIcon

  return (
    <>
      <button
        ref={refs.setReference}
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
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-9999"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMenu ? (
              renderMenu(() => setIsOpen(false))
            ) : (
              <ContextualMenu items={menuItems} onClick={handleItemClick} />
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export default Dropdown
