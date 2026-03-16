import pino from "pino"

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname,scope",
      translateTime: "SYS:standard",
      messageFormat: "[{scope}] {msg}",
    },
  },
}).child({ scope: "Blockfrost" })
