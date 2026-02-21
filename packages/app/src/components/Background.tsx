export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <picture className="max-[744px]:hidden">
        <source
          media="(min-width: 1929px)"
          srcSet="/backgrounds/bg-large.svg"
        />
        <source
          media="(min-width: 1440px)"
          srcSet="/backgrounds/bg-desktop.svg"
        />
        <source
          media="(min-width: 744px)"
          srcSet="/backgrounds/bg-tablet.svg"
        />
        <img
          src="/backgrounds/bg-tablet.svg"
          alt="Background"
          className="h-full w-full object-cover opacity-24"
        />
      </picture>
    </div>
  )
}
