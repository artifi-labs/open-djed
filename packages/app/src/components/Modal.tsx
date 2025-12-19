import React, { type ReactNode } from "react"
import { AnimatePresence, motion, type Variants } from "framer-motion"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center px-2 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-light-foreground dark:bg-dark-foreground flex max-h-full max-w-full min-w-xs flex-col overflow-auto rounded-lg p-4 sm:max-h-[85vh] sm:max-w-[800px]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-light-text dark:border-dark-text sticky top-0 z-10 flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="hover:text-primary-hover cursor-pointer text-2xl font-semibold transition"
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
