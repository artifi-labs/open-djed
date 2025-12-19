import { useTheme } from "../context/ThemeContext"
import { FiSun, FiMoon } from "react-icons/fi"
import Button from "./Button"

type ThemeToggleProps = {
  size?: "xs" | "sm" | "md" | "lg" | "full"
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = "xs" }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      size={size}
      className="flex justify-center text-white transition-colors"
    >
      {isDarkMode ? (
        <FiSun className="h-6 w-5" />
      ) : (
        <FiMoon className="h-6 w-5" />
      )}
    </Button>
  )
}
