import Image from "next/image"
import LinkButton from "./LinkButton"

export type ErrorPageProps = {
  statusCode: number
  title: string
  subtitle?: string
  buttonText: string
  buttonHref: string
}

const ErrorPage = ({
  statusCode = 404,
  title,
  subtitle,
  buttonText,
  buttonHref,
}: ErrorPageProps) => {
  return (
    <div className="m-auto flex flex-col items-center justify-center text-center">
      <div className="desktop:gap-[36px] flex flex-col items-center justify-center gap-12">
        <Image
          src={`/errors/${statusCode}.svg`}
          width={346}
          height={138}
          alt={`${statusCode} error`}
          className="h-[65px] w-[162px] md:h-[138px] md:w-[346px]"
        />

        <div className="flex flex-col gap-[8px]">
          <h1 className="font-medium">{title}</h1>
          <p className="text-secondary text-sm font-medium whitespace-pre-line">
            {subtitle}
          </p>
        </div>

        <LinkButton
          href={buttonHref}
          variant="accent"
          size="small"
          text={buttonText}
          target="_self"
        />
      </div>
    </div>
  )
}

export default ErrorPage
