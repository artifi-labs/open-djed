"use client"
import LinkButton from "@/components/new-components/LinkButton"

export default function DashboardPage() {
  return (
    <div className="desktop:pt-32 desktop:pb-64 w-full pt-16 pb-16">
      {/* Header */}
      <div className="desktop:flex-row flex flex-col justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-bold">Open DJED</h1>
          <span className="text-secondary text-xs">Stablecoin</span>
        </div>
        <LinkButton
          href="#"
          variant="text"
          size="medium"
          text="What is Open DJED?"
          className="items-center text-center"
        />
      </div>
      {/* Content */}
      <div className="desktop:grid-cols-2 desktop:gap-24 desktop:pt-32 grid grid-cols-1 gap-16 pt-16">
        <div className="bg-black">Left Side</div>
        <div className="bg-black">Right Side</div>
      </div>
    </div>
  )
}
