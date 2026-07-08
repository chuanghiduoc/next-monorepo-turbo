/**
 * Runs once at server start. Importing `@/lib/env` validates required env vars
 * (Zod) at boot, so a missing/bad var fails fast instead of surfacing per-request
 * — the Docker build skips validation, this restores it at runtime. Also the
 * seam to init an observability SDK (OpenTelemetry/Sentry) later.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/env")
  }
}
