# Testing — Vitest + RTL + MSW (unit) · Playwright (e2e)

Two test layers, gated in CI:

- **Unit / integration** — **Vitest** + **React Testing Library**, with **MSW**
  mocking the `/api/*` boundary so hooks and components run against fake HTTP.
- **End-to-end** — **Playwright** across Chromium / Firefox / WebKit against a
  real `pnpm dev` server.

> Files: `apps/<app>/vitest.config.ts`, `tests/setup.ts`, `tests/test-utils.tsx`,
> `tests/mocks/*`, `tests/unit/*`, `tests/e2e/*`, `playwright.config.ts`.

---

## 1. What to test where

| Test this                                                              | Layer              | Tool         |
| ---------------------------------------------------------------------- | ------------------ | ------------ |
| A query/mutation hook, a validation schema, a store, a pure util       | unit               | Vitest       |
| A component's render / states / interaction                            | unit (integration) | Vitest + RTL |
| The HTTP boundary (does the hook call `/api/...` and map the response) | unit               | Vitest + MSW |
| A full user flow across pages (login redirect, form submit)            | e2e                | Playwright   |
| Auth-gate / proxy redirect behavior                                    | e2e                | Playwright   |

Rule of thumb: **anything with real routing, cookies, or navigation → e2e**;
everything else → unit with MSW.

---

## 2. Vitest config

`apps/<app>/vitest.config.ts`:

```ts
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
        /* config/tests */
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
```

Key points:

- **`environment: "jsdom"`** — a DOM for RTL.
- **`include` is scoped to `tests/unit/`** — put unit tests there; `tests/e2e/`
  is Playwright's and is not picked up by Vitest.
- **Aliases mirror the app** — `@/…`, `@workspace/ui`, `@workspace/api-client`
  resolve to source (not built dist), so tests run against current code.

---

## 3. The MSW mock boundary

Instead of mocking `fetch`/axios, MSW intercepts the actual HTTP calls to
`/api/*`. Tests exercise the **real hook and real axios instance** — only the
network is faked.

`tests/mocks/handlers.ts`:

```ts
import { http, HttpResponse } from "msw"
const PROXY_BASE = "http://localhost:3000/api"

export const handlers = [
  http.get(`${PROXY_BASE}/v1/health`, () =>
    HttpResponse.json({
      status: "ok",
      uptime: 42,
      timestamp: new Date().toISOString(),
    })
  ),
  http.get(`${PROXY_BASE}/auth/get-session`, () => HttpResponse.json(null)),
  http.post(`${PROXY_BASE}/auth/sign-in/email`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({
        user: { id: "u_1", email: body.email, name: "Test User" },
      })
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    )
  }),
]
```

> The handler URL uses the **absolute** `http://localhost:3000/api/...` because in
> jsdom the axios base URL resolves against that origin. Match the full URL.

`tests/mocks/server.ts` assembles the Node server:

```ts
import { setupServer } from "msw/node"
import { handlers } from "./handlers"
export const server = setupServer(...handlers)
```

`tests/setup.ts` runs it around every test and **resets handlers between tests**
so per-test overrides don't leak:

```ts
import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach, beforeAll } from "vitest"
import { server } from "./mocks/server"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers()) // ← isolation
afterAll(() => server.close())
```

`onUnhandledRequest: "warn"` surfaces any call you forgot to mock instead of
hanging.

---

## 4. Render helper with providers

`tests/test-utils.tsx` wraps components in a **fresh, retry-disabled**
QueryClient so tests are deterministic and fast:

```tsx
function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 }, // no retry, no cache carryover
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const client = makeClient()
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return render(ui, { wrapper: Wrapper, ...options })
}

export * from "@testing-library/react" // re-export screen, waitFor, etc.
```

Always render Query-dependent components with `renderWithProviders`, and import
`screen`/`waitFor` **from `../test-utils`** (not RTL directly) so you get the
re-exports in one place. A **new client per render** means no state bleeds
between tests.

---

## 5. A unit test — hook against MSW

`tests/unit/use-health.test.tsx`:

```tsx
import { useHealth } from "@workspace/api-client"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen, waitFor } from "../test-utils"

function HealthProbe() {
  const { data, isLoading } = useHealth()
  if (isLoading) return <p>loading</p>
  return <p data-testid="status">{data?.status}</p>
}

describe("useHealth", () => {
  it("returns ok status from the mocked backend", async () => {
    renderWithProviders(<HealthProbe />)
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ok")
    })
  })
})
```

Pattern: wrap the hook in a tiny **probe component**, render it, and
`waitFor` the async result. The hook, axios, and Query all run for real — MSW
returns the health payload from §3.

**Per-test override** — mock an error for one test without touching the shared
handlers:

```tsx
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

it("shows the down state on 503", async () => {
  server.use(
    http.get("http://localhost:3000/api/v1/health", () =>
      HttpResponse.json({ message: "unavailable" }, { status: 503 })
    )
  )
  renderWithProviders(<HealthProbe />)
  // …assert error UI. resetHandlers() in setup restores the default after.
})
```

---

## 6. Testing a form (schema + RHF)

Render the form, submit empty, assert the Zod errors surfaced via
`aria-invalid` / `FormMessage`, then fill and submit against an MSW handler:

```tsx
import userEvent from "@testing-library/user-event"

it("blocks submit until the schema passes", async () => {
  renderWithProviders(<LoginPage />)
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
  expect(await screen.findByText(/at least 8 characters/i)).toBeVisible()

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com")
  await userEvent.type(screen.getByLabelText(/password/i), "password123")
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
  // MSW sign-in handler returns the user → assert the redirect/toast
})
```

Assert on **user-visible output** (roles, labels, text), not internal state —
that's the RTL philosophy and it's what makes these tests survive refactors.

---

## 7. E2E with Playwright

`playwright.config.ts`:

```ts
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  projects: [
    /* chromium, firefox, webkit */
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
})
```

- Playwright **boots `pnpm dev`** itself unless `PLAYWRIGHT_SKIP_WEBSERVER` is set
  (use that when a server is already running).
- Runs across **three browser engines**; `retries: 2` only in CI to absorb flake.

`tests/e2e/auth.spec.ts` — tests the **proxy auth gate** end to end:

```ts
test("unauthenticated visit to /dashboard redirects to /login", async ({
  page,
}) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login(\?.*)?$/)
  await expect(page.getByLabel("Email")).toBeVisible()
})

test("login form shows validation errors on empty submit", async ({ page }) => {
  await page.goto("/login")
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible()
})
```

Two conventions here:

- **Locale-agnostic selectors** — the tests match `Email` (same label in `vi`/`en`)
  and `aria-invalid`, not translated copy, so they pass in either locale.
- **The redirect assertion exercises `proxy.ts`** — it's the real gate, not a
  mock. This is why auth-gate behavior belongs in e2e, not unit.

---

## 8. Running

```bash
pnpm test              # all unit tests (turbo, all apps)
pnpm --filter app test # one app's unit tests
pnpm test:e2e          # Playwright (boots dev server)
pnpm --filter app test:coverage   # coverage report
```

CI runs unit + build, then Playwright e2e (see [system-architecture.md §12](../system-architecture.md)).
`test`/`test:e2e` `dependsOn: ["^build"]` in `turbo.json`, so packages build first.

---

## 9. Do / Don't

**Do**

- Put unit tests in `tests/unit/`, e2e in `tests/e2e/`.
- Mock the HTTP boundary with MSW; let the real hook/axios run.
- Render with `renderWithProviders`; import `screen`/`waitFor` from `test-utils`.
- Assert on roles/labels/text (user-visible), not implementation details.
- Use `server.use(...)` for per-test overrides — `resetHandlers()` cleans up.
- Keep e2e selectors locale-agnostic.

**Don't**

- Don't mock `fetch`/axios by hand — MSW intercepts the real call.
- Don't share one QueryClient across tests — `makeClient()` per render.
- Don't put routing/cookie/redirect assertions in unit tests — use e2e.
- Don't assert on translated copy in e2e — labels drift per locale.
- Don't leave a `server.use` override without relying on `resetHandlers()`.

---

## Related

- [data-fetching.md](./data-fetching.md) — the hooks these tests exercise.
- [forms-and-validation.md](./forms-and-validation.md) — the `aria-invalid` behavior asserted above.
- [auth.md](./auth.md) — the `proxy.ts` gate the e2e redirect test covers.
