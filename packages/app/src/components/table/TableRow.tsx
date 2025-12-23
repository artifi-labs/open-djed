import React from "react"
import clsx from "clsx"

type ColumnItem = {
  content: React.ReactNode
}

export type RowItem = {
  columns: ColumnItem[]
}

interface TableRowProps {
  row: RowItem
  hasBorder?: boolean
}

const TableRow: React.FC<TableRowProps> = ({ row, hasBorder }) => {
  return (
    <tr
      className={clsx(
        "hover:bg-background-primary-hover text-primary text-xs",
        { "border-border-primary mx-2 border-b": hasBorder },
      )}
    >
      {row.columns.map((column, index) => (
        <td key={index} className="p-4">
          {column.content}
        </td>
      ))}
    </tr>
  )
}

export default TableRow
