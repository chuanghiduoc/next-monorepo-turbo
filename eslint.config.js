import { config } from "@workspace/eslint-config/base"

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    // Each workspace lints itself with its own flat config via `turbo lint`
    // (apps use the Next.js ruleset, packages/ui the React one). ESLint 9 does
    // NOT cascade configs by directory the way .eslintrc did, so a root-level
    // run would lint workspace sources with the wrong — weaker — ruleset, and
    // would also walk build output. Keep the root run to repo-level files.
    ignores: [
      "apps/**",
      "packages/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/dist/**",
    ],
  },
  ...config,
  {
    // Repo-root Node utility scripts run on Node, not in the browser.
    files: ["scripts/**/*.{mjs,js,cjs}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        Buffer: "readonly",
      },
    },
  },
]
