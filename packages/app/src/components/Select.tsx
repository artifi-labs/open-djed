import React, { useState, useRef, useEffect } from 'react'

type Option = {
  label: string
  value: string
}

type SelectProps = {
  options: Option[]
  className?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  defaultValue?: string
  name?: string
  size: 'sm' | 'md' | 'lg' | 'full'
}

const Select = ({ options, className = '', onChange, defaultValue, name, size = 'md' }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Option>(
    options.find((option) => option.value === defaultValue) || options[0],
  )

  const dropdownRef = useRef<HTMLUListElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleSelect = (option: Option) => {
    setSelected(option)

    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: option.value,
          selectedOptions: [{ text: option.label, value: option.value }],
        },
        currentTarget: {
          name,
          value: option.value,
          selectedOptions: [{ text: option.label, value: option.value }],
        },
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: new Event('change'),
      } as unknown as React.ChangeEvent<HTMLSelectElement>

      onChange(syntheticEvent)
    }

    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const sizeClass = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-40',
    full: 'w-full',
  }[size]

  return (
    selected && (
      <div className={`relative ${sizeClass} ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="w-full flex justify-between items-center bg-white border border-primary px-4 py-2 rounded shadow dark:bg-dark-bg focus:outline-none transition-all duration-200 ease-in-out"
          name={name}
        >
          {selected.label}
          <svg
            className={`h-4 w-4 transition-transform duration-200 dark:fill-white ${
              isOpen ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </button>

        {isOpen && (
          <ul
            ref={dropdownRef}
            className="absolute left-0 right-0 mt-1 bg-white dark:bg-dark-bg border border-primary rounded shadow z-10"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  console.log('Clicked on option:', option)
                  handleSelect(option)
                }}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-primary hover:text-white ${
                  selected.value === option.value
                    ? 'bg-primary/50 dark:bg-primary/50 text-white font-medium'
                    : ''
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  )
}

export default Select
