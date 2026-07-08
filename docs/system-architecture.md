# System Architecture

The engineering reference for this monorepo: what the stack is, where code
lives, and **when to reach for which tool**. Read this before adding a feature,
a page, or a new app.

> Companion docs: [`code-standards.md`](./code-standards.md) (conventions &
> quality gates) · [`guides/`](./guides/README.md) (how-to per library: data
> fetching, forms, auth, state, env, i18n, testing, logging). Product overview
> lives in the root [`README.md`](../README.md).

---

## 1. Tech stack

| Layer         | Choice                                                            | Why / notes                                             |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| Monorepo      | **Turborepo** + **pnpm workspaces**                               | Task graph + caching; `apps/*`, `packages/*`.           |
| Framework     | **Next.js 16** (App Router, RSC, Turbopack)                       | Server Components by default.                           |
| UI runtime    | **React 19**                                                      | Server + client components, `use` / Suspense.           |
| Language      | **TypeScript 5.9** (strict)                                       | `noUncheckedIndexedAccess`, `noImplicitOverride`.       |
| Styling       | **Tailwind CSS v4** (`@theme`, oklch tokens)                      | No config file — theme lives in `packages/ui`.          |
| Components    | **shadcn/ui** in `@workspace/ui`                                  | ~60 primitives, customized once, shared by all apps.    |
| Icons         | **lucide-react**                                                  | No brand/logo icons — use generic ones.                 |
| Charts        | **recharts 3** via `@workspace/ui/components/chart`               | `ChartContainer` + `ChartConfig`.                       |
| Auth          | **Better Auth** (cookie sessions)                                 | Same session in browser / RSC / route handlers / proxy. |
| Data fetching | **TanStack Query** + typed **api-client**                         | Orval-generated hooks optional; all traffic proxied.    |
| i18n          | **next-intl** (`vi` default, `en`)                                | `[locale]` segment + `messages/*.json`.                 |
| Forms         | **React Hook Form** + **Zod**                                     | Validation at the boundary.                             |
| State         | **Zustand** (persist + SSR hydration)                             | Local UI state only.                                    |
| Logging       | **Pino** (server only, redacted)                                  | Never import into client code.                          |
| Tests         | **Vitest** + RTL + MSW (unit), **Playwright** (e2e)               | Gated in CI.                                            |
| Tooling       | ESLint 9, Prettier, Husky, Commitlint, Knip, Syncpack, Changesets | Enforced pre-commit + CI.                               |

---

## 2. Monorepo layout

```
next-monorepo-turbo/
├── apps/
│   ├── landing/     # public marketing site + /preview UI kit  (:3001, indexable)
│   ├── app/         # user product — "Acme"-style dashboard     (:3000, noindex)
│   └── admin/       # ops/admin console — "OrbitOps"-style       (:3002, noindex)
├── packages/
│   ├── ui/                # @workspace/ui — design system (tokens + components)
│   ├── api-client/        # @workspace/api-client — HTTP + React Query hooks
│   ├── eslint-config/     # shared ESLint flat config
│   └── typescript-config/ # shared tsconfig bases
├── docs/            # this folder
├── plans/           # implementation plans & reports
├── turbo.json       # task pipeline + env declarations
└── scripts/remove-app.mjs   # `pnpm remove-app <name>` — drop an unused app
```

**All three apps share one design system.** Change a token or a primitive in
`packages/ui` and every app updates. This is the core reason the apps stay
visually consistent — do **not** fork component styles per app.

---

## 3. Anatomy of an app

Every app follows the same App Router shape (next-intl "locale-as-root" — there
is **no** `app/layout.tsx`; the locale layout owns `<html>`/`<body>`):

```
apps/<app>/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # root layout: fonts, providers, <html>, generateMetadata
│   │   ├── page.tsx            # locale index (redirect for app/admin; marketing for landing)
│   │   ├── error.tsx           # segment error boundary (client)
│   │   ├── loading.tsx         # streaming skeleton
│   │   ├── not-found.tsx       # localized 404
│   │   ├── (auth)/             # public group: login, register + split-screen layout
│   │   └── (app)/              # protected group: layout guards session, renders shell
│   │       ├── layout.tsx      # SidebarProvider + Sidebar + Header + scroll region
│   │       └── <route>/page.tsx
│   ├── api/[...path]/route.ts  # same-origin proxy → BACKEND_URL
│   ├── global-error.tsx        # top-level boundary (own <html>/<body>, inline styles)
│   ├── not-found.tsx           # root 404 for non-localized paths (own <html>/<body>)
│   ├── robots.ts               # landing: allow+sitemap · app/admin: disallow all
│   ├── manifest.ts             # PWA manifest
│   ├── sitemap.ts              # landing only
│   └── opengraph-image.tsx     # landing only (next/og)
├── components/                 # app-local components (not shared)
├── lib/                        # auth-server, auth-client, env, logger, query-client, validation, stores
├── i18n/                       # routing.ts, navigation.ts, request.ts
├── messages/                   # en.json, vi.json
├── proxy.ts                    # i18n + auth-cookie gate (+ PREVIEW_AUTH escape hatch) — Next 16 renamed `middleware.ts` → `proxy.ts`
└── next.config.ts
```

### Route groups

- **`(auth)`** — public. `layout.tsx` renders a split-screen brand panel + form.
- **`(app)`** — protected. `layout.tsx` calls `getServerSession()`, redirects to
  `/login` when absent, then renders the **app shell** (see §7).

---

## 4. Rendering model — Server vs Client

**Default to Server Components.** Add `"use client"` only when a file needs:
interactivity (state/effects/handlers), browser APIs, a chart (recharts reads
the DOM), or a hook like `useTranslations` in an interactive widget.

| Situation                                          | Component type                 |
| -------------------------------------------------- | ------------------------------ |
| Page, layout, static section, table of sample data | **Server**                     |
| Form, dropdown, toggle, tabs, theme switch         | **Client**                     |
| Any recharts chart (Area/Bar/Pie…)                 | **Client**                     |
| KPI cards with a sparkline                         | **Client wrapper** (see below) |

**RSC → Client boundary gotcha:** you **cannot** pass a function/component (e.g. a
lucide icon) as a prop from a Server Component to a Client Component. Pattern:
put the data (icons, series) inside a small `"use client"` wrapper and render it
from the server page. Example: `overview-stats.tsx` defines the icons + spark
arrays and renders `<StatCard>`; the page just renders `<OverviewStats />`.

---

## 5. Data flow — API proxy & auth

```
Browser ──/api/*──▶ Next route handler ──▶ BACKEND_URL/*        (server-only)
   ▲                                            │
   └──────────── cookie (same-origin) ──────────┘
RSC ──────────── getServerSession() ────────────▶ BACKEND_URL/api/auth/get-session
```

- **The backend URL is server-only.** The browser only ever talks to
  `/api/*` on its own origin; `BACKEND_URL` never reaches the bundle → no CORS.
- **Auth** is cookie-based (Better Auth). Read the session:
  - Server: `getServerSession()` from `@/lib/auth-server` (React-cached).
  - Client: `useSession()` from `@/lib/auth-client`.
  - Proxy (`proxy.ts`): checks the session cookie to gate protected paths.
- **Preview mode** — `PREVIEW_AUTH=1` (dev-only, in `.env.local`) makes
  `getServerSession()` return a mock user and the proxy skip the redirect,
  so you can browse protected pages without a backend. Declared in
  `turbo.json → globalEnv`. Off by default; never set in production.

---

## 6. Design system — `@workspace/ui`

### Tokens (single source of truth)

Defined in `packages/ui/src/styles/globals.css` as CSS variables (oklch) mapped
to Tailwind utilities via `@theme inline`. Semantic tokens — **use these, never
raw hex**:

| Token                                        | Utility                         | Use                                                         |
| -------------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `--primary` / `--brand`                      | `bg-brand` `text-brand`         | Enterprise **blue** — primary actions, accents, active nav. |
| `--highlight`                                | `bg-highlight` `text-highlight` | **Amber** — featured CTAs / highlights (sparingly).         |
| `--success` `--warning` `--destructive`      | `text-success` …                | Status: green / amber / red.                                |
| `--muted` `--border` `--card` `--foreground` | `bg-muted` …                    | Neutral surfaces (cool slate).                              |
| `--chart-1..5`                               | `var(--chart-N)`                | Chart series.                                               |
| `--font-sans` `--font-mono` `--font-display` | `font-sans` …                   | Geist + Geist Mono + Bricolage (headings).                  |

Light + dark values are paired; never invert colors by hand — the `.dark` block
handles it.

### When to put code where

| You are building…                                           | Put it in…                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| A generic, reusable primitive (button, dialog, new variant) | `packages/ui/src/components/` — benefits all apps.                        |
| A new **variant** of a primitive                            | Edit the primitive's `cva` in `packages/ui` (e.g. Badge `success`).       |
| A feature/page-specific component                           | `apps/<app>/components/<feature>/` — app-local.                           |
| A KPI card                                                  | Reuse `StatCard` (`@/components/stat-card`); wrap in a client component.  |
| A chart                                                     | `ChartContainer` + `ChartConfig` + recharts primitives, in a client file. |

**Do not** hand-edit all 60 primitives to re-theme — they inherit from tokens.
Only touch a component to add a variant or change structure.

### Card / section conventions

- Card surface: `rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]`.
- Page `<h1>`: `font-heading text-2xl font-semibold tracking-tight`; subtitle `text-sm text-muted-foreground`.
- Numbers: `tabular-nums`. Section titles: `text-sm font-semibold`.
- Deterministic chart/sample data only (`Math.sin` over index) — **no
  `Math.random()` / `new Date()`** in module scope (SSR hydration safety).

---

## 7. App shell & scrolling

Protected `(app)/layout.tsx` uses the shadcn **Sidebar** primitive:

```
<SidebarProvider className="h-svh overflow-hidden">   ← fixed viewport, no body scroll
  <Sidebar collapsible="icon">  ← grouped nav + trial card; auto Sheet on mobile
  <SidebarInset className="flex flex-col overflow-hidden">
    <Header/>                    ← fixed: SidebarTrigger + search(⌘K) + bell + user
    <div className="min-h-0 flex-1 overflow-y-auto"> {children} </div>   ← only this scrolls
```

**Rule:** the sidebar and header stay fixed; only the content region scrolls
(app-like). Never let the whole page scroll the shell away. The sidebar is
responsive out of the box (icon-collapse on desktop, off-canvas Sheet on mobile
via the `use-mobile` hook).

---

## 8. Internationalization

- `next-intl`, locales `vi` (default) + `en`, `[locale]` route segment.
- Structural chrome (nav, titles, shared labels) → `messages/{en,vi}.json`,
  read via `useTranslations` (client) / `getTranslations` (server).
- Locale-aware navigation: import `Link`, `useRouter`, `usePathname`,
  `redirect` from `@/i18n/navigation` (not `next/link`).
- Static rendering needs `setRequestLocale(locale)` in layouts/pages.
- Sample/demo data may stay inline English; user-facing chrome must be
  translated.

---

## 9. Metadata & SEO

Next.js metadata file conventions live at `app/` root (not under `[locale]`):

| File                  | landing                | app / admin               |
| --------------------- | ---------------------- | ------------------------- |
| `robots.ts`           | allow + sitemap ref    | `disallow: "/"` (noindex) |
| `sitemap.ts`          | per-locale public URLs | —                         |
| `manifest.ts`         | ✓ PWA                  | ✓ PWA                     |
| `opengraph-image.tsx` | ✓ (`next/og`)          | —                         |

Per-page titles come from `generateMetadata` (`title` + a `%s · turbo/…`
template set in the locale layout). App/admin set `robots: { index:false }`.

---

## 10. Error handling & loading

| File                     | Scope   | Notes                                                          |
| ------------------------ | ------- | -------------------------------------------------------------- |
| `[locale]/loading.tsx`   | segment | Skeleton while streaming.                                      |
| `[locale]/error.tsx`     | segment | Client boundary, `reset()` retry.                              |
| `[locale]/not-found.tsx` | locale  | Styled 404 (uses i18n `Link`).                                 |
| `app/global-error.tsx`   | root    | Replaces root layout — **own `<html>/<body>`**, inline styles. |
| `app/not-found.tsx`      | root    | Non-localized 404 — own `<html>/<body>`.                       |

---

## 11. Adding things — quick recipes

**A new protected page** (e.g. `/reports` in `app`):

1. `apps/app/app/[locale]/(app)/reports/page.tsx` — server component, `<>…</>` (layout owns padding).
2. Add `export async function generateMetadata` returning a `title`.
3. Add the nav entry + label in `components/app-sidebar.tsx` and `messages/{en,vi}.json → nav`.
4. Build sections from `@workspace/ui` + `StatCard`/charts; keep sample data deterministic.

**A new shared component / variant:** add to `packages/ui/src/components/`
(or extend a `cva`), then reuse everywhere. Run `pnpm --filter @workspace/ui typecheck`.

**A new app:** copy an existing app dir, rename in `package.json` + port + Dockerfile,
register in `knip.json` / `docker-compose.yml`, `pnpm install`. Remove one with
`pnpm remove-app <name>`.

**A new backend call:** go through `/api/*` (proxy). Prefer Orval-generated hooks
in `@workspace/api-client`, or hand-written React Query hooks.

---

## 12. Quality gates

Run from the repo root (Turbo fans out across packages):

```bash
pnpm dev          # all apps in parallel (app :3000 · landing :3001 · admin :3002)
pnpm lint         # eslint --max-warnings 0
pnpm typecheck    # strict tsc
pnpm test         # vitest
pnpm build        # production build (validates metadata routes + static gen)
pnpm knip         # unused files/deps
pnpm syncpack:check
```

CI (`.github/workflows/`) runs lint + typecheck + unit + build, Playwright e2e,
and Changesets release. Commits use Conventional Commits (enforced by
commitlint); no secrets or `.env` files are ever committed.

---

## 13. Non-negotiables (the short list)

1. Server Components by default; `"use client"` only when required.
2. Style from **tokens**, never raw hex; never fork component styles per app.
3. Backend URL is server-only; all client traffic goes through `/api/*`.
4. Fixed shell — only the content region scrolls.
5. Deterministic data at module scope (no `Math.random`/`Date`).
6. i18n chrome via `messages/*`; navigation via `@/i18n/navigation`.
7. Keep lint + typecheck + build green before every commit.
