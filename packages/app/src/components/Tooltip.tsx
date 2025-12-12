interface TooltipProps {
  text: string
  tooltipDirection?: "top" | "bottom" | "left" | "right"
  style?: React.CSSProperties
  tooltipModalClass?: string
  children?: React.ReactNode
}

const Tooltip = ({
  text,
  tooltipDirection = "top",
  style,
  tooltipModalClass: tooltipModalClass,
  children,
}: TooltipProps) => {
  const tooltipClass = `tooltip tooltip-${tooltipDirection}`.trim()
  const tooltipModalStyle = `tooltip-content ${tooltipModalClass}`.trim()

  return (
    <div className={tooltipClass} style={style}>
      <div className={tooltipModalStyle}>
        <div className="rounded-lg bg-white p-2 opacity-95 dark:bg-black">
          {text}
        </div>
      </div>
      {children ?? <i className="fa-solid fa-circle-info" />}
    </div>
  )
}

export default Tooltip
