import React from 'react'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ref?: React.Ref<HTMLButtonElement> | undefined
  disabled?: boolean
  dark?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full'
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, ref, disabled, size = 'md' }) => {
  const sizeClass = {
    xs: 'w-13',
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-40',
    full: 'w-full',
  }[size]

  return (
    <button
      className={`${sizeClass} text-white font-bold bg-primary flex items-center justify-center h-auto ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary-hover cursor-pointer'
      } transition-opacity px-4 py-2 rounded-lg ${className}`}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
