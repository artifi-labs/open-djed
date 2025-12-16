import * as React from "react"

type SkrimProps = {
  className?: string
  children?: React.ReactNode
}

const Skrim: React.FC<SkrimProps> = ({ className, children }) => {
  return (
    <div
      className={`bg-skrim fixed inset-0 flex h-full w-full opacity-80 ${className || ""} `}
    >
      {children}
    </div>
  )
}

export default Skrim
