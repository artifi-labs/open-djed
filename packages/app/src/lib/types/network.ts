import type { env } from "@/lib/envLoader"

export type Network = keyof typeof env.CONFIG
