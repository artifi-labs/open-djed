import Image from "next/image"

export default function Background() {
  return (
    <picture>
      <source media="(min-width: 1929px)" srcSet="/backgrounds/bg-large.svg" />
      <source
        media="(min-width: 1440px)"
        srcSet="/backgrounds/bg-desktop.svg"
      />
      <source media="(min-width: 744px)" srcSet="/backgrounds/bg-tablet.svg" />
      <Image
        src="/backgrounds/bg-mobile.svg"
        alt="Background"
        fill
        priority
        className="-z-10 object-cover"
      />
    </picture>
  )
}
