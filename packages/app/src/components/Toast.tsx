import { useEffect } from 'react'

const Toast = ({
  message,
  show,
  onClose,
  type = 'success',
}: {
  message: string
  show: boolean
  onClose: () => void
  type?: 'success' | 'error'
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 4_000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return <div className="hidden"></div>

  return (
    <div
      className={`
      fixed bottom-5 right-5 px-5 py-3 rounded shadow-lg z-50 
      flex items-center gap-3 text-white
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
    `}
    >
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 text-lg font-bold">
        ×
      </button>
    </div>
  )
}

export default Toast
