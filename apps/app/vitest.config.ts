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
      reporter: ["text", "html", "lcov"],
      exclude: [
        "tests/**",
        ".next/**",
        "playwright.config.ts",
        "vitest.config.ts",
        "next.config.ts",
        "**/*.d.ts",
      ],
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
