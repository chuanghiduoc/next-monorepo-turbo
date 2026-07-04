import "server-only"

import { pino } from "pino"

import { env } from "@/lib/env"

const isDev = env.NODE_ENV === "development"

export const logger = pino({
  level: env.LOG_LEVEL ?? "info",
  base: { service: "admin" },
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname,service",
        },
      }
    : undefined,
})
