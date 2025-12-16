import React from "react"
import type { ReactNode } from "react"
import clsx from "clsx"

type ColumnItem = {
  content: ReactNode
}

interface TableRowProps {
  columns: ColumnItem[]
  hasBorder?: boolean
}

const TableRow: React.FC<TableRowProps> = ({ columns, hasBorder }) => {
  return (
    <tr
      className={clsx(
        `hover:bg-background-primary-hover text-primary text-md`,
        {
          "border-border-primary mx-2 border-b": hasBorder,
        },
      )}
    >
      {columns?.map((column, index) => {
        return (
          <td key={index} className={clsx("p-4")}>
            {column.content}
          </td>
        )
      })}
    </tr>
  )
}

export default TableRow
