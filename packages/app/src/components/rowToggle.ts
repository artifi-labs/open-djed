export const isSelectingText = () => {
  if (typeof window === "undefined") return false
  return (window.getSelection()?.toString().length ?? 0) > 0
}
