import { BREAKPOINTS } from "@/utils/breakpoints"
import { useMediaQuery } from "react-responsive"

export const useViewport = () => {
  const isMobile = useMediaQuery({ maxWidth: BREAKPOINTS.desktop - 1 })
  const isDesktop = useMediaQuery({ minWidth: BREAKPOINTS.desktop })

  return { isMobile, isDesktop }
}
