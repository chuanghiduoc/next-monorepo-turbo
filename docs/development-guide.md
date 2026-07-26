# Development Guide

The hands-on, from-zero-to-shipped walkthrough for this monorepo. If
[`system-architecture.md`](./system-architecture.md) answers _"how is it built and
where does code live?"_ and [`code-standards.md`](./code-standards.md) answers
_"how do I write it?"_, this file answers **"what do I actually type, step by
step, to build and ship a feature?"**

New here? Read it top to bottom once. Coming back? Jump to
[§4 Build a feature](#4-build-a-feature-end-to-end).

---

## 1. Prerequisites

- **Node.js 22+** (CI and the images run 24; Node 20 is past end of life) and
  **pnpm 10.33+** — enable via Corepack:
  ```bash
  corepack enable && corepack prepare pnpm@10.33.4 --activate
  ```
- **Docker 24+** — only needed for the production image, not for local dev.
- A running **backend** (separate repo) that exposes `/api/auth/*` and `/api/v1/*`.
  No backend yet? Use **preview mode** (§3) to browse the UI without one.

---

## 2. First-time setup

```bash
git clone https://github.com/chuanghiduoc/next-monorepo-turbo.git
cd next-monorepo-turbo
pnpm install                 # installs the whole workspace + wires Husky hooks
```

Create a local env file **for each app you keep** (they don't share one):

```bash
cp apps/app/.env.example     apps/app/.env.local
cp apps/landing/.env.example apps/landing/.env.local
cp apps/admin/.env.example   apps/admin/.env.local
```

Then edit each `.env.local` and point `BACKEND_URL` at your backend:

| Variable              | Scope        | Meaning                                                       |
| --------------------- | ------------ | ------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | **client**   | Frontend's own public URL (browser-visible).                  |
| `BACKEND_URL`         | **server**   | Backend origin. Proxied via `/api/*`; never hits the browser. |
| `LOG_LEVEL`           | server       | Pino level (`fatal`…`trace`, default `info`).                 |
| `PREVIEW_AUTH`        | server (dev) | `1` = fake session, skip the backend (see §3).                |

Env is validated on boot by `@t3-oss/env-nextjs` + Zod (`apps/<app>/lib/env.ts`).
A missing/invalid var **fails the build loudly** — that's intended.

---

## 3. Run it

```bash
pnpm dev                     # every app in parallel (Turbopack)
pnpm --filter app dev        # just one app (app | landing | admin)
```

| Surface    | URL                                             |
| ---------- | ----------------------------------------------- |
| app (user) | <http://localhost:3000>                         |
| landing    | <http://localhost:3001>                         |
| admin      | <http://localhost:3002>                         |
| API proxy  | <http://localhost:3000/api/*> → `BACKEND_URL/*` |
| English    | <http://localhost:3000/en> (Vietnamese is `/`)  |

**No backend?** Set `PREVIEW_AUTH=1` in `apps/<app>/.env.local`. `getServerSession()`
then returns a mock user and the middleware skips the login redirect, so you can
browse the protected pages. Turn it **off** for anything real — it is dev-only and
must never be set in production.

---

## 4. Build a feature end-to-end

Goal: add a protected **Reports** page to `apps/app`, with a KPI row and a chart.
This is the canonical loop — every feature is a variation of it.

### 4.1 Create the page (Server Component)

`apps/app/app/[locale]/(app)/reports/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server"

import { ReportsStats } from "@/components/reports/reports-stats"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("reports") }
}

export default async function ReportsPage() {
  const t = await getTranslations("nav")
  return (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {t("reports")}
      </h1>
      <ReportsStats />
    </>
  )
}
```

- The route lives under `(app)/`, so `(app)/layout.tsx` already guards the session
  and owns the page padding — return a plain `<>…</>`, don't re-wrap in a container.
- Pages stay **Server Components**. Read the session with `getServerSession()` when
  you need the user; never fetch it client-side just to render.

### 4.2 Add the interactive parts (Client Component)

Anything with state, charts, or event handlers needs `"use client"`. Because you
**cannot pass icons/functions across the RSC→client boundary**, define that data
_inside_ the client wrapper:

`apps/app/components/reports/reports-stats.tsx`:

```tsx
"use client"

import { Activity, DollarSign } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

// Deterministic sample data — no Math.random()/new Date() at module scope.
const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 16 + i * 1.4)
  )

export function ReportsStats() {
  const stats: Stat[] = [
    {
      label: "Reports run",
      value: "1,204",
      delta: "+12%",
      up: true,
      period: "vs last month",
      icon: Activity,
      spark: spark(0),
    },
    {
      label: "Export cost",
      value: "$82.10",
      delta: "-4%",
      up: true,
      period: "vs last month",
      icon: DollarSign,
      spark: spark(3),
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
```

Charts follow the same rule: build them in a `"use client"` file with
`ChartContainer` + `ChartConfig` from `@workspace/ui/components/chart`.

### 4.3 Wire navigation + translations

1. Add the label to **both** locales so nothing renders a raw key:
   - `apps/app/messages/en.json` → `"nav": { "reports": "Reports" }`
   - `apps/app/messages/vi.json` → `"nav": { "reports": "Báo cáo" }`
2. Add the sidebar entry in `apps/app/components/app-sidebar.tsx` (use `Link` from
   `@/i18n/navigation`, **not** `next/link`, so the locale is preserved).

### 4.4 Talk to the backend

Client code hits the **same-origin proxy** only — never `BACKEND_URL` directly:

```tsx
"use client"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@workspace/api-client" // axios instance, baseURL "" → /api/*

function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => apiClient.get("/api/v1/reports").then((r) => r.data),
  })
}
```

If the backend ships an OpenAPI spec, prefer generated hooks instead:
`BACKEND_URL=http://localhost:4000 pnpm codegen` emits typed React Query hooks
into `packages/api-client/src/generated/`. Both modes coexist.

Server-side data (in an RSC) can skip the proxy and fetch the backend directly —
that's what `getServerSession()` does.

### 4.5 Add a reusable primitive (only if it's truly shared)

Need a component every app will use, or a new variant of an existing one? Put it
in the design system, not the app:

- New primitive → `packages/ui/src/components/`.
- New variant → extend that primitive's `cva` (e.g. a `success` Badge).
- Verify in isolation: `pnpm --filter @workspace/ui typecheck`.

App-only components stay in `apps/<app>/components/`. Don't promote something to
`@workspace/ui` until there's a real second consumer (YAGNI).

---

## 5. Test what you built

```bash
pnpm --filter app test          # vitest + RTL + MSW (unit/integration)
pnpm exec turbo run test:e2e --filter=app   # playwright — `... exec playwright install` once
```

- **Unit/integration:** `apps/<app>/tests/unit/`. Mock network with MSW handlers in
  `tests/mocks/` — don't hit a real backend in unit tests.
- **E2E:** `apps/<app>/tests/e2e/`. Runs against the **production** server, so go
  through turbo (`test:e2e` depends on `build`); calling the package script
  directly skips the build. Playwright forces `PREVIEW_AUTH=0` — with the preview
  bypass on, the auth-gate specs pass without testing any gate.
- Test **behavior**, not implementation. When a test fails, fix the code (or the
  test's wrong assumption) — never weaken the assertion to go green.

---

## 6. Ship it — quality gates & PR

Run the full gate from the repo root before opening a PR:

```bash
sh .husky/pre-push   # lint · typecheck · test:coverage · build · knip · syncpack
```

That hook is deliberately the same six checks CI runs, in the same order, so the
two cannot drift. Then:

1. **Changeset** for any user-facing package change: `pnpm changeset`.
2. **Commit** with Conventional Commits — `feat:`, `fix:`, `docs:`, `chore:`… No AI
   references, no plan IDs / phase numbers in the message. Husky runs lint-staged
   (Prettier) plus `turbo lint` and `typecheck` on commit, commitlint on the
   message, and the full gate on push.
3. **Open the PR.** CI runs the six checks above plus an osv-scanner dependency
   audit (`ci.yml`), Playwright against a production build (`e2e.yml`), CodeQL,
   and gitleaks. Keep it green.

Two things a green local run does **not** prove:

- Builds set `SKIP_ENV_VALIDATION=1`, and skipping validation skips the Zod
  **defaults** too — a var you rely on may arrive `undefined` in CI.
- `.env.local` exists on your machine and not in CI, so anything it supplies is
  effectively unset there.

Lint note: linting must go through `turbo lint`, never `eslint` from the repo
root. ESLint 9 flat config does not cascade by directory, so a root-level run
applies the root ruleset to workspace sources instead of each workspace's own.

---

## 7. Common tasks — quick reference

| Task                      | Do this                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| Add a protected page      | `(app)/<route>/page.tsx` + `generateMetadata` + nav entry + `messages/*`   |
| Add a public page         | Put it under `(auth)/` or the locale root instead of `(app)/`.             |
| Add a shared component    | `packages/ui/src/components/`; extend a `cva` for a new variant.           |
| Add a backend call        | Client → `/api/*` via `@workspace/api-client`; or `pnpm codegen`.          |
| Add a translation         | Key in **both** `messages/en.json` and `messages/vi.json`.                 |
| Add an env var            | Add to `lib/env.ts` (Zod), `runtimeEnv`, `.env.example`, and `turbo.json`. |
| Remove an app             | `pnpm remove-app <name>` (cleans knip / changeset / compose).              |
| Add a new app             | Copy an app dir, rename package/port/Dockerfile, register, `pnpm install`. |
| Preview without a backend | `PREVIEW_AUTH=1` in `.env.local` (dev only).                               |

---

## 8. Troubleshooting

| Symptom                                    | Likely cause / fix                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Build fails on missing env                 | `.env.local` incomplete — copy from `.env.example`; Zod fails fast by design.                             |
| "Cannot pass function to Client Component" | You passed an icon/handler across the RSC→client boundary — move it into a `"use client"` wrapper (§4.2). |
| Hydration mismatch                         | `Math.random()`/`new Date()` at module scope — use deterministic sample data.                             |
| Locale lost on navigation                  | Imported `Link` from `next/link` — use `@/i18n/navigation`.                                               |
| Raw translation key shows on screen        | Missing key in one of `messages/{en,vi}.json`.                                                            |
| Whole page scrolls the shell away          | Content isn't inside the scroll region — see architecture §7.                                             |
| CORS error in the browser                  | You called `BACKEND_URL` directly — route the call through `/api/*`.                                      |

For anything deeper — rendering model, data flow, design tokens, the app shell —
go to [`system-architecture.md`](./system-architecture.md).
