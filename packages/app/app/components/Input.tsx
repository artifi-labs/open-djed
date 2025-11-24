type InputProps = {
  id: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'datetime-local'
  className?: string
}

export const Input = ({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  type = 'text',
  className = '',
}: InputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative">
        <input
          id={id}
          type={type}
          className={`border-2 border-primary rounded-md px-4 py-2 text-lg w-full focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 ${
            error ? 'text-red-500 border-red-500' : ''
          }`}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}
