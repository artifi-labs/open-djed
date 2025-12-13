import * as React from "react"

interface MaskProps {
  length: number
}

const Mask: React.FC<MaskProps> = ({ length }) => {
  return (
    <>
      {Array.from({ length }).map((_, i) => (
        <div key={i} className="h-2 w-2 rounded-full bg-white" />
      ))}
    </>
  )
}

export default Mask
