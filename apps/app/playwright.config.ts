import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        // Production server, not `next dev`: e2e must exercise what actually
        // ships (minified bundles, real caching, no dev-only error overlay).
        // `turbo test:e2e` builds first via the task's `dependsOn`.
        //
        // `next start` prints a warning about `output: "standalone"`; that
        // config only matters for the Docker image (which runs server.js) —
        // `next start` serves the same build correctly for tests.
        command: "pnpm start",
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        env: {
          // The design-preview bypass grants a fake session, which would make
          // the auth-gate specs pass without ever testing the gate. Forced off
          // here so a developer's PREVIEW_AUTH=1 in .env.local cannot mask it.
          PREVIEW_AUTH: "0",
        },
      },
})
