import React, { useState, useMemo } from "react"
import TableHeader, { type TableHeaderSize } from "./TableHeader"
import TableRow from "./TableRow"
import Pagination from "../Pagination"

export interface HeaderItem {
  column: React.ReactNode
  columnKey: string
  size?: TableHeaderSize
  onSort?: (columnKey: string) => void
  sortDirection?: "asc" | "desc" | "none"
  sortable?: boolean
  action?: React.ReactNode
}

export interface RowItem {
  columns: { content: React.ReactNode }[]
  hasBorder?: boolean
}

interface TableProps {
  headers: HeaderItem[]
  rows: RowItem[]
  totalCount: number
  rowsPerPage?: number
  paginatedTable?: boolean
}

export function Table({
  headers,
  rows,
  totalCount,
  rowsPerPage = 6,
  paginatedTable = true,
}: TableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const lastPage = totalCount
    ? Math.ceil(totalCount / rowsPerPage)
    : Math.ceil(rows.length / rowsPerPage)

  const currentRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    return rows.slice(startIndex, endIndex)
  }, [rows, currentPage, rowsPerPage])

  if (currentPage > lastPage && lastPage > 0) {
    setCurrentPage(lastPage)
  }

  const rowsToRender = currentRows.length > 0 ? currentRows : []

  return (
    <div className="w-full">
      {/* Table */}
      <div className="bg-background-primary border-border-primary max-h-175 w-full overflow-auto rounded-t-lg border border-b-0 px-2">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-background-primary sticky top-0 z-10">
              <tr>
                {headers.map((header) => (
                  <TableHeader
                    key={header.columnKey}
                    column={header.column}
                    columnKey={header.columnKey}
                    size={header.size}
                    onSort={header.onSort}
                    sortDirection={header.sortDirection}
                    sortable={header.sortable}
                    action={header.action}
                  />
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {rowsToRender.map((rowData, index) => (
                <TableRow
                  key={index}
                  columns={rowData.columns}
                  hasBorder={index !== rowsToRender.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginatedTable && (
        <div className="border-border-primary bg-background-primary w-full rounded-b-lg border px-24 py-12">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default Table
