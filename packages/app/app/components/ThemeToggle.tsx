import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import Button from './Button'

type ThemeToggleProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full'
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 'xs' , ...props}) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Button onClick={toggleTheme} size={size} className="text-white transition-colors flex justify-center" {...props}>
      {isDarkMode ? <FiSun className="w-5 h-6" /> : <FiMoon className="w-5 h-6" />}
    </Button>
  )
}
