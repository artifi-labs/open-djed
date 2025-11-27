import type { JSX } from 'react'

interface FooterIconProps {
  label: string
  lightIcon?: string
  darkIcon?: string
  element?: JSX.Element
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-[16px] h-[16px] text-[16px]',
  md: 'w-[20px] h-[20px] text-[20px]',
  lg: 'w-[28px] h-[28px] text-[28px]',
}

const FooterIcon = ({ element, lightIcon, darkIcon, label, size = 'md' }: FooterIconProps) => {
  const sizeClass = sizeClasses[size]

  return (
    <>
      {element ? (
        <span className={`${sizeClass} inline-flex items-center justify-center`}>{element}</span>
      ) : darkIcon ? (
        <>
          <img
            src={lightIcon}
            alt={`${label} icon`}
            className={`${sizeClass} inline-block dark:hidden transition-all duration-200 ease-in-out`}
          />
          <img
            src={darkIcon}
            alt={`${label} icon`}
            className={`${sizeClass} hidden dark:inline-block transition-all duration-200 ease-in-out`}
          />
        </>
      ) : (
        <img
          src={lightIcon}
          alt={`${label} icon`}
          className={`${sizeClass} inline-block transition-all duration-200 ease-in-out`}
        />
      )}
    </>
  )
}

export default FooterIcon
