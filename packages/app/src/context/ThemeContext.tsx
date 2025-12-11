import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

function setThemeCookie(theme: 'dark' | 'light') {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  let cookie = `theme=${theme}; Path=/; Max-Age=${60 * 60 * 24 * 365}`
  if (!isLocalhost) {
    cookie += '; Domain=.artifex.finance'
  }
  document.cookie = cookie
}

/* function getThemeCookie(): 'dark' | 'light' | null {
  const match = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/)
  return match ? (match[1] as 'dark' | 'light') : null
} */

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const theme =
      document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/)?.[1] ?? localStorage.getItem('theme')

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = theme === 'dark' || (!theme && systemDark)

    setIsDarkMode(shouldUseDark)

    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(shouldUseDark ? 'dark' : 'light')

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(isDarkMode ? 'dark' : 'light')

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    setThemeCookie(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, isHydrated])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  if (!isHydrated) return null

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
