import { notFound } from "next/navigation"

// This page is a catch-all for any routes that don't match existing pages or locales.
export default function CatchAllPage() {
  notFound()
}
