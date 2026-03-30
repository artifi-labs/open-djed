/**
 * Sanitizes numeric input for financial values.
 *
 * Rules:
 * - Removes commas (`,`) used as thousand separators
 * - Allows only digits (`0–9`) and a single dot (`.`)
 * - Removes any extra dots after the first one
 * - Prepends a zero if the value starts with a dot (e.g., ".5" becomes "0.5")
 *
 * @param {string} value - Raw input string from the user
 * @returns {string} Sanitized numeric string
 *
 * @example
 * sanitizeNumberInput("1,000,000.00")   // "1000000.00"
 * sanitizeNumberInput("1,5")            // "15"
 * sanitizeNumberInput(",5")             // "0.5"
 */
export function sanitizeNumberInput(v: string): string {
  // Remove commas and invalid characters
  let sanitized = v.replace(/,/g, "").replace(/[^0-9.]/g, "")

  // Keep only the first dot
  const parts = sanitized.split(".")
  const first = parts[0] || ""
  sanitized = first + (parts.length > 1 ? "." + parts.slice(1).join("") : "")

  // Prepend zero if starting with dot
  if (sanitized.startsWith(".")) {
    return "0" + sanitized
  }

  return sanitized
}

/**
 * Formats a numeric string for display with thousand separators,
 * while preserving user input for live typing.
 *
 * Rules:
 * - Adds commas to the integer part for readability
 * - Keeps the decimal part intact while typing
 * - Trims the decimal part to `maxDecimalPlaces` if provided
 * - Preserves a trailing dot if the user types it
 *
 * @param {string} value - Clean numeric string
 * @param {number} [maxDecimalPlaces] - Optional maximum number of decimals
 * @returns {string} Formatted numeric string for display
 *
 * @example
 * formatStringToNumber("1234")           // "1,234"
 * formatStringToNumber("1234.5")         // "1,234.5"
 */
export function formatLiveStringToNumber(
  value: string,
  maxDecimalPlaces?: number,
) {
  if (!value) return ""

  const [intPartRaw, decPartRaw] = value.split(".")

  // Remove leading zeros from integer part
  const intPart = intPartRaw.replace(/^0+(?=\d)/, "") || "0"

  // Handle decimal part and max decimal places
  let decPart = decPartRaw ?? ""
  if (maxDecimalPlaces !== undefined) {
    decPart = decPart.slice(0, maxDecimalPlaces)
  }

  // Format integer part with commas
  const formattedInt = parseInt(intPart, 10).toLocaleString("en-US")
  return decPart !== ""
    ? `${formattedInt}.${decPart}`
    : value.endsWith(".")
      ? `${formattedInt}.`
      : formattedInt
}

/**
 * Checks if a value is considered "empty" for financial inputs.
 *
 * A value is considered empty if it is:
 * - null or undefined
 * - a string that is empty, contains only whitespace, or represents the number 0
 * - a number that is equal to 0
 *
 * @param val - The value to check
 * @returns True if the value is empty, false otherwise
 */
export const isEmptyValue = (val: unknown) => {
  if (val === null || val === undefined) return true
  if (typeof val === "string") {
    const t = val.trim()
    if (t === "") return true
    const n = Number(t)
    if (!Number.isNaN(n)) return n === 0
    return false
  }
  if (typeof val === "number") return val === 0
  return false
}
