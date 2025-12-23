import React, { useState, useMemo } from "react"
import type { ComponentType } from "react"
import TableHeader, { type TableHeaderSize } from "./TableHeader"
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

export type TableProps<T> = {
  headers: HeaderItem[]
  rows: T[]
  totalCount: number
  rowsPerPage?: number
  paginatedTable?: boolean
  currentPage?: number
  onPageChange?: (page: number) => void
  serverSidePagination?: boolean
  RowComponent: ComponentType<{
    row: T
    hasBorder?: boolean
  }>
}

function Table<T>({
  headers,
  rows,
  totalCount,
  rowsPerPage = 10,
  paginatedTable = true,
  currentPage: externalCurrentPage,
  onPageChange,
  serverSidePagination = false,
  RowComponent,
}: TableProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)

  // Use external pagination if provided, otherwise use internal
  const currentPage = serverSidePagination
    ? (externalCurrentPage ?? 1)
    : internalCurrentPage
  const setCurrentPage = serverSidePagination
    ? onPageChange
    : setInternalCurrentPage

  const lastPage = Math.ceil(totalCount / rowsPerPage)

  // Only slice rows if using client-side pagination
  const currentRows = useMemo(() => {
    if (serverSidePagination) {
      return rows // Rows are already paginated from server
    }
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return rows.slice(startIndex, endIndex)
  }, [rows, currentPage, rowsPerPage, serverSidePagination])

  if (currentPage > lastPage && lastPage > 0 && setCurrentPage) {
    setCurrentPage(lastPage)
  }

  const rowsToRender = currentRows.length > 0 ? currentRows : []

  return (
    <div className="w-full">
      {/* Table */}
      <div className="bg-background-primary border-border-primary max-h-fit w-full overflow-auto rounded-t-lg border border-b-0 px-2">
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
              {rowsToRender.map((row, index) => (
                <RowComponent
                  key={index}
                  row={row}
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
            setCurrentPage={setCurrentPage ?? setInternalCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default Table
