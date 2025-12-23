import { useState } from "react"

/**
 * Custom React hook to copy text to the clipboard
 * and track whether the copy action was successful.
 *
 * @param timeout - Time in milliseconds before resetting `copied` state (default: 2000ms)
 * @returns An object with:
 *   - `copy`: function to copy a string to the clipboard
 *   - `copied`: boolean indicating if the text was successfully copied
 */
export const useClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  return { copy, copied }
}
