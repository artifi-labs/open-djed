import * as React from "react"
import "./loading.css"

export type LoadingProps = {
  size?: number
}

const Loading: React.FC<LoadingProps> = ({ size = 24 }) => {
  return <div className="loading-icon" style={{ width: size, height: size }} />
}

export default Loading
