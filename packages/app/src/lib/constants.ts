import type { ActionType } from "@open-djed/api"
import { env } from "./envLoader"

export const ACTIONS: ActionType[] = ["Mint", "Burn"]
export const DISCORD_URL = "https://discord.gg/MhYP7w8n8p"
export const WEBSITE_URL = "https://artifi.finance"
export const STATUS_URL = "https://status.artifi.finance"
export const GITHUB_URL = "https://github.com/artifi-labs"
export const LINKEDIN_URL = "https://www.linkedin.com/company/artifi-finance/"
export const TWITTER_URL = "https://x.com/artifi_labs"
export const TWITTER_HANDLE = "@artifi_labs"
export const DJED_URL = "https://djed.xyz"
export const APP_NAME = "Open Djed"
export const TEAM_NAME = "Artifi Labs"
export const CARDANOSCAN_BASE_URL = `https://${env.NETWORK === "Preprod" ? env.NETWORK.toLowerCase() + "." : ""}cardanoscan.io`

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
]

export const ORDERS_PER_PAGE = 10
export const ORDERS_SIDEBAR = 5

export const ALLOWED_WALLETS = [
  "eternl",
  "yoroi",
  "lace",
  "begin",
  "gerowallet",
  "vespr",
]

export const SHEN_SIMULATOR_COLOR = "accent-3"
export const ADA_SIMULATOR_COLOR = "accent-1"
