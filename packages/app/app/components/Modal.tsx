import React, { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 px-2"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-light-foreground dark:bg-dark-foreground min-w-xs rounded-lg p-4 max-w-full max-h-full sm:max-w-[800px] sm:max-h-[85vh] overflow-auto flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-light-text dark:border-dark-text pb-2 sticky top-0 z-10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-2xl font-semibold transition cursor-pointer hover:text-primary-hover"
              >
                &times;
              </button>
            </div>

            <div className="overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
