import "server-only"

import { pino } from "pino"

import { env } from "@/lib/env"

const isDev = env.NODE_ENV === "development"

// The `?? "info"` is load-bearing, not redundant with the Zod default: builds
// run with SKIP_ENV_VALIDATION=1 (Docker, CI), and skipping validation also
// skips the schema defaults, so LOG_LEVEL arrives undefined. pino then throws
// "default level:undefined must be included in custom levels" at import time
// and the build fails while collecting page data.
export const logger = pino({
  level: env.LOG_LEVEL ?? "info",
  base: { service: "app" },
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
