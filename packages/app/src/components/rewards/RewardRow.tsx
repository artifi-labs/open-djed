"use client"

import * as React from "react"
import clsx from "clsx"
import ButtonIcon from "@/components/ButtonIcon"
import { isSelectingText } from "@/components/rowToggle"

export type RewardRowData = {
  key: string
  columns: { content: React.ReactNode }[]
  isPlaceholder?: boolean
  details?: React.ReactNode
}

const RewardRow: React.FC<{ row: RewardRowData; hasBorder?: boolean }> = ({
  row,
  hasBorder,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const expandable = Boolean(row.details) && !row.isPlaceholder
  const lastIndex = row.columns.length - 1

  const toggle = () => setIsOpen((v) => !v)

  const handleRowClick = () => {
    if (isSelectingText()) return
    toggle()
  }

  return (
    <>
      <tr
        onClick={expandable ? handleRowClick : undefined}
        className={clsx("text-primary text-xs", {
          "hover:bg-background-primary-hover": !row.isPlaceholder && !isOpen,
          "bg-background-primary-pressed": isOpen,
          "border-border-primary border-b": hasBorder && !isOpen,
        })}
      >
        {row.columns.map((column, index) =>
          index === lastIndex && expandable ? (
            <td key={index}>
              <div className="flex items-center justify-end gap-8 px-16 py-12">
                {column.content}
                <ButtonIcon
                  size="tiny"
                  variant="onlyIcon"
                  icon="Chevron-down"
                  className={clsx("transition-transform duration-200", {
                    "rotate-180": isOpen,
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle()
                  }}
                />
              </div>
            </td>
          ) : (
            <td key={index}>{column.content}</td>
          ),
        )}
      </tr>

      {isOpen && expandable && (
        <tr className="bg-background-primary-pressed border-border-tertiary border-b">
          <td colSpan={row.columns.length} className="p-8">
            <div className="border-border-tertiary rounded-8 border">
              {row.details}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default RewardRow
