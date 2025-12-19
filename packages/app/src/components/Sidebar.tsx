import React from "react"

type SidebarProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ children, isOpen, onClose }) => {
  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`dark:bg-dark-foreground fixed top-0 right-0 z-50 h-full w-96 transform overflow-hidden bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-around" onClick={onClose}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
