import Link from "next/link"
import React from "react"
import Image from "next/image"

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="/logos/opendjed-logo.svg"
        alt="Open Djed Logo"
        width={123}
        height={28}
      />
    </Link>
  )
}

export default Logo
