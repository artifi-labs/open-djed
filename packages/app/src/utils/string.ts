/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalize = (str: string = ""): string => {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converts a string to lowercase and then capitalizes the first letter
 * @param str - The string to format
 * @returns The string with first letter capitalized and the rest in lowercase
 */
export const capitalizeLower = (str: string = ""): string => {
  if (!str) return ""
  const lower = str.toLowerCase()
  return capitalize(lower)
}

/**
 * Shortens a string by keeping the first `start` and last `end` characters,
 * and adding "..." in the middle if the string is longer than `start + end`.
 *
 * @param text - The string to shorten
 * @param start - Number of characters to keep at the start (default 6)
 * @param end - Number of characters to keep at the end (default 4)
 * @returns Shortened string
 *
 * Example:
 * shortenString("addr1q8xyz123tx3c") => "addr1q...tx3c"
 */
export const shortenString = (text: string, start = 4, end = 6): string => {
  if (text.length <= start + end) return text
  return `${text.slice(0, start)}...${text.slice(-end)}`
}
