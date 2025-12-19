import React from "react"
import clsx from "clsx"
import Icon from "../Icon"

export type TableHeaderSize = "small" | "medium" | "full" | "auto"
interface TableHeaderProps {
  column: React.ReactNode
  columnKey: string
  size?: TableHeaderSize
  onSort?: (columnKey: string) => void
  sortDirection?: "asc" | "desc" | "none"
  sortable?: boolean
  action?: React.ReactNode
}

const TableHeader: React.FC<TableHeaderProps> = ({
  column,
  columnKey,
  size = "full",
  onSort,
  sortDirection = "none",
  sortable = false,
  action,
}) => {
  const columnWidths = {
    medium: "w-[419px]",
    small: "w-[136px]",
    full: "w-full",
    auto: "w-auto",
  }

  const isSortable = typeof onSort === "function" && sortable

  const handleClick = () => {
    if (isSortable) {
      onSort(columnKey)
    }
  }

  const iconName = !isSortable
    ? null
    : sortDirection === "asc"
      ? "Ascending"
      : sortDirection === "desc"
        ? "Descending"
        : "Sort"

  const ariaSortValue =
    sortDirection === "asc"
      ? "ascending"
      : sortDirection === "desc"
        ? "descending"
        : "none"

  return (
    <th
      scope="col"
      className={clsx(
        "text-tertiary text-xxs px-16 py-12 text-left font-normal",
        columnWidths[size],
        {
          "cursor-pointer": isSortable,
        },
      )}
      onClick={handleClick}
      aria-sort={isSortable ? ariaSortValue : "none"}
    >
      <div className={"flex items-center justify-between gap-1"}>
        <div className="flex items-center gap-1">
          <span>{column}</span>
          {iconName && (
            <Icon name={iconName} size={16} className="text-grey-300 ms-1" />
          )}
        </div>
        {action && (
          <span className="ml-auto py-2 pr-0 text-right">{action}</span>
        )}
      </div>
    </th>
  )
}

export default TableHeader
