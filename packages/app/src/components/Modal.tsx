import React, { type ReactNode } from "react"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import ButtonIcon from "./new-components/ButtonIcon"

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
            className="bg-surface-secondary border-gradient border-color-gradient rounded-8 dark:bg-dark-foreground bg-light-foreground relative flex max-h-full max-w-full min-w-xs flex-col overflow-auto p-42 sm:max-h-[85vh] sm:max-w-200"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-light-text dark:border-dark-text sticky top-0 z-10 flex items-center justify-between pb-16">
              <h2 className="text-primary font-bold">{title}</h2>
            </div>

            <div className="absolute top-12 right-12 z-20">
              <ButtonIcon
                variant="onlyIcon"
                icon="Close"
                size="medium"
                onClick={onClose}
              />
            </div>

            <div className="overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
