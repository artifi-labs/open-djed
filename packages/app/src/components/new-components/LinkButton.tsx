import Link from "next/link"
import { ButtonProps } from "./Button"
import Button from "./Button"

export type LinkButtonProps = {
  href: string
  buttonContent?: React.ReactNode
  target?: string
} & ButtonProps

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  buttonContent,
  target = "_blank",
  ...props
}) => {
  const isExternal = href.startsWith("https")

  return (
    <Link
      href={href}
      target={isExternal ? target : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex items-center"
    >
      <Button {...props}>{buttonContent}</Button>
    </Link>
  )
}

export default LinkButton
