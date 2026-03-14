import { BREAKPOINTS } from "@/utils/breakpoints"
import { useMediaQuery } from "react-responsive"
import { useEffect, useState } from "react"

export const useViewport = () => {
  const [mounted, setMounted] = useState(false)

  const isMobile = useMediaQuery({ maxWidth: BREAKPOINTS.desktop - 1 })
  const isDesktop = useMediaQuery({ minWidth: BREAKPOINTS.desktop })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return { isMobile: false, isDesktop: false }

  return { isMobile, isDesktop }
}
