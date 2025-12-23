import type { TransactionItem } from "./TransactionSummary"

export type TransactionSummaryBuilder = {
  addSingle(
    label: string,
    topValue: string,
    bottomValue: string,
  ): TransactionSummaryBuilder

  addMulti(
    label: string,
    values: Array<[string, string]>,
  ): TransactionSummaryBuilder

  addIf(
    condition: boolean,
    build: (b: TransactionSummaryBuilder) => void,
  ): TransactionSummaryBuilder

  build(): TransactionItem[]
}

export const transactionSummaryBuilder = (): TransactionSummaryBuilder => {
  const items: TransactionItem[] = []

  const builder: TransactionSummaryBuilder = {
    addSingle(label, topValue, bottomValue) {
      items.push({
        label,
        values: [{ topValue, bottomValue }],
        parentIndex: 0,
      })
      return builder
    },

    addMulti(label, values) {
      items.push({
        label,
        values: values.map(([topValue, bottomValue]) => ({
          topValue,
          bottomValue,
        })),
        parentIndex: 0,
      })
      return builder
    },

    addIf(condition, build) {
      if (condition) build(builder)
      return builder
    },

    build() {
      return items
    },
  }

  return builder
}
