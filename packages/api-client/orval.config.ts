import { defineConfig } from "orval"

/**
 * Orval codegen — runs only when the backend exposes an OpenAPI spec.
 *
 * Default `input.target` points at the local NestJS dev server. Override via:
 *   API_OPENAPI_URL=https://api.example.com/docs-json pnpm codegen
 *
 * If the backend does not have a spec, ignore this file and write hooks
 * by hand in `src/hooks/`.
 */
export default defineConfig({
  api: {
    input: {
      target:
        process.env.API_OPENAPI_URL ??
        `${process.env.BACKEND_URL ?? "http://localhost:4000"}/docs-json`,
    },
    output: {
      workspace: "./src/generated/",
      target: "./api.ts",
      schemas: "./schemas",
      client: "react-query",
      httpClient: "axios",
      mode: "tags-split",
      indexFiles: true,
      clean: true,
      prettier: true,
      override: {
        useNamedParameters: true,
        mutator: {
          path: "../lib/axios-instance.ts",
          name: "customAxiosInstance",
        },
        query: {
          useQuery: true,
          useSuspenseQuery: true,
          useInfinite: true,
          signal: true,
        },
      },
    },
  },
})
