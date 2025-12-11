import React from 'react'

type SidebarProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ children, isOpen, onClose }) => {
  return (
    <div>
      {isOpen && <div className="fixed inset-0 backdrop-blur-sm z-40" onClick={onClose} />}

      <div
        className={`bg-white dark:bg-dark-foreground shadow-lg w-96 fixed top-0 right-0 h-full transform transition-transform duration-300 ease-in-out z-50 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-around" onClick={onClose}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
