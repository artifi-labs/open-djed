import type { OutRef } from "@lucid-evolution/lucid"

export const parseOutRef = (outRefStr: string): OutRef => {
  const txOutRef = outRefStr.match(
    // In words, a txOutRef starts with 64 hex characters, followed by '#',
    // followed by up to 2 digits, then ends.
    /^(?<txHash>[0-9a-fA-F]{64})(?<separator>[#\-.])(?<index>\d+)$/,
  )

  if (!txOutRef?.groups?.txHash || !txOutRef.groups.index) {
    throw new Error(
      `Expected a txOutRef in <tx-hash><separator><index> format, got: "${outRefStr}"`,
    )
  }

  return {
    txHash: txOutRef.groups.txHash,
    outputIndex: Number(txOutRef.groups.index),
  }
}
