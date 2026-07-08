import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Gate the pure-logic surface only; wiring and UI are covered by e2e.
      // Thresholds are a ratchet — widen `include` and raise them as tests grow.
      include: ["lib/validation/**/*.ts", "lib/stores/**/*.ts"],
      exclude: [
        "tests/**",
        ".next/**",
        "playwright.config.ts",
        "vitest.config.ts",
        "next.config.ts",
        "instrumentation.ts",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@workspace/ui": resolve(__dirname, "../../packages/ui/src"),
      "@workspace/api-client": resolve(
        __dirname,
        "../../packages/api-client/src"
      ),
    },
  },
})
