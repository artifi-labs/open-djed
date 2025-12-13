import { BREAKPOINTS } from "@/utils/breakpoints"
import { useMediaQuery } from "react-responsive"

export const useViewport = () => {
  const isMobile = useMediaQuery({ maxWidth: BREAKPOINTS.tablet - 1 })
  const isTablet = useMediaQuery({
    minWidth: BREAKPOINTS.tablet,
    maxWidth: BREAKPOINTS.desktop - 1,
  })
  const isDesktop = useMediaQuery({
    minWidth: BREAKPOINTS.desktop,
    maxWidth: BREAKPOINTS.large - 1,
  })
  const isLarge = useMediaQuery({ minWidth: BREAKPOINTS.large })

  return { isMobile, isTablet, isDesktop, isLarge }
}
