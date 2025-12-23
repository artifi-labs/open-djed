"use client"

import * as React from "react"
import clsx from "clsx"
//import Link from "next/link"
import ButtonIcon from "./ButtonIcon"
import { type Order } from "@open-djed/api"
import { useViewport } from "@/hooks/useViewport"

interface TransactionDetailsProps {
  row: {
    key: string
    columns: { content: React.ReactNode }[]
    raw: Order
  }
  hasBorder?: boolean
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  row,
  hasBorder,
}) => {
  const { isMobile } = useViewport()
  const [isOpen, setIsOpen] = React.useState(false)

  const { raw } = row
  const isProcessing = raw.status === "Processing"
  const isCreated = raw.status === "Created"
  const isCompleted = raw.status === "Completed"

  return (
    <>
      {/* Main Row */}
      <tr
        className={clsx(
          "text-primary text-xs transition-colors duration-200",
          isOpen
            ? "bg-background-primary-pressed"
            : "hover:bg-background-primary-hover",
          { "border-border-primary border-b": hasBorder && !isOpen },
        )}
      >
        {row.columns.map((column, index) => {
          const isLast = index === row.columns.length - 1

          return (
            <td key={index} className={clsx({ relative: isLast && isMobile })}>
              {isLast ? (
                <div className="flex items-center justify-end gap-8 px-16 py-12">
                  {column.content}

                  {(isProcessing || isCreated || isCompleted) &&
                    (isMobile ? (
                      <ButtonIcon
                        size="tiny"
                        variant="onlyIcon"
                        icon="Chevron-down"
                        className={clsx(
                          "transition-transform duration-200",
                          {
                            "rotate-180": isOpen,
                          },
                          "absolute top-14 right-4",
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen((v) => !v)
                        }}
                      />
                    ) : (
                      <ButtonIcon
                        size="tiny"
                        variant="onlyIcon"
                        icon="Chevron-down"
                        className={clsx("transition-transform duration-200", {
                          "rotate-180": isOpen,
                        })}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen((v) => !v)
                        }}
                      />
                    ))}
                </div>
              ) : (
                <div className="p-4">{column.content}</div>
              )}
            </td>
          )
        })}
      </tr>

      {/* Details Row */}
      {isOpen && (
        <tr className="bg-background-primary-pressed border-border-tertiary border-b">
          <td colSpan={row.columns.length + 1} className="p-8">
            <div className="border-border-tertiary rounded-8 border">
              {(isProcessing || isCreated) && (
                <div className="flex flex-col gap-2 px-16 py-12 text-xs">
                  <span className="text-tertiary text-xxs">
                    Estimated Execution Fee:
                  </span>
                  <div className="text-primary">
                    {(Number(raw.fees) / 1_000_000).toFixed(2)} ₳
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="grid grid-cols-1 text-xs">
                  {/* TODO: Batched */}
                  {/* <div className="flex flex-col gap-2 px-16 py-12">
                    <span className="text-tertiary text-xxs">Batched at:</span>
                    <div className="text-primary flex items-center gap-8 truncate">
                      {raw.received} ₳
                      <Link
                        href={`https://preview.cardanoscan.io/transaction/${raw.tx_hash}`}
                        target="_blank"
                      >
                        <ButtonIcon
                          variant="onlyIcon"
                          size="tiny"
                          icon="External"
                        />
                      </Link>
                    </div>
                  </div> */}

                  {/* TODO: Deposit */}
                  {/* <div className="flex flex-col gap-2 px-16 py-12">
                    <span className="text-tertiary text-xxs">
                      Deposited ADA:
                    </span>
                    <div className="text-primary">{raw.received} ₳</div>
                  </div> */}

                  {/* TODO: Trading Fee */}
                  {/* <div className="flex flex-col gap-2 px-16 py-12">
                    <span className="text-tertiary text-xxs">Trading Fee:</span>
                    <div className="text-primary">{raw.fees} ADA</div>
                  </div> */}

                  {/* Executed Fee */}
                  <div className="flex flex-col gap-2 px-16 py-12">
                    <span className="text-tertiary text-xxs">
                      Executed Fee:
                    </span>
                    <div className="text-primary">
                      {raw.fees === undefined
                        ? "-"
                        : (Number(raw.fees) / 1_000_000).toFixed(2)}{" "}
                      ₳
                    </div>
                  </div>

                  {/* TODO: Executed Price */}
                  {/* <div className="flex flex-col gap-2 px-16 py-12">
                    <span className="text-tertiary text-xxs">
                      Executed Price:
                    </span>
                    <div className="text-primary">{raw.paid}</div>
                  </div> */}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TransactionDetails
