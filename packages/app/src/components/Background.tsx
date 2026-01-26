export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <picture>
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
          src="/backgrounds/bg-mobile.svg"
          alt="Background"
          className="h-full w-full object-cover opacity-24"
        />
      </picture>
    </div>
  )
}
