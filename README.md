<h1 align="center">next-monorepo-turbo</h1>

<p align="center">
  <strong>Production-grade Next.js 16 + React 19 + Turborepo monorepo boilerplate.</strong><br/>
  shadcn/ui · Better Auth · TanStack Query · next-intl · Vitest · Playwright — wired and tested.
</p>

<p align="center">
  <a href="https://github.com/chuanghiduoc/next-monorepo-turbo/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/chuanghiduoc/next-monorepo-turbo/ci.yml?branch=main&label=CI&logo=github&style=flat-square" /></a>
  <a href="https://github.com/chuanghiduoc/next-monorepo-turbo/actions/workflows/e2e.yml"><img alt="E2E" src="https://img.shields.io/github/actions/workflow/status/chuanghiduoc/next-monorepo-turbo/e2e.yml?branch=main&label=E2E&logo=playwright&style=flat-square" /></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/github/license/chuanghiduoc/next-monorepo-turbo?style=flat-square" /></a>
  <a href="https://github.com/chuanghiduoc/next-monorepo-turbo/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/chuanghiduoc/next-monorepo-turbo?style=flat-square" /></a>
  <a href="https://github.com/chuanghiduoc/next-monorepo-turbo/issues"><img alt="Open issues" src="https://img.shields.io/github/issues/chuanghiduoc/next-monorepo-turbo?style=flat-square" /></a>
  <a href="https://github.com/chuanghiduoc/next-monorepo-turbo/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/chuanghiduoc/next-monorepo-turbo?style=flat-square" /></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white&style=flat-square" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000&style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square" />
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white&style=flat-square" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-10.33-F69220?logo=pnpm&logoColor=white&style=flat-square" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-radix--nova-000?style=flat-square" />
  <img alt="Better Auth" src="https://img.shields.io/badge/Better%20Auth-cookie%20sessions-7C3AED?style=flat-square" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack-Query%205-FF4154?logo=reactquery&logoColor=white&style=flat-square" />
  <img alt="next-intl" src="https://img.shields.io/badge/next--intl-vi%20%2F%20en-2D7DD2?style=flat-square" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white&style=flat-square" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-1.60-2EAD33?logo=playwright&logoColor=white&style=flat-square" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-standalone-2496ED?logo=docker&logoColor=white&style=flat-square" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#why-this-boilerplate">Why this boilerplate?</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#common-commands">Commands</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## Table of Contents

- [Why this boilerplate?](#why-this-boilerplate)
- [Highlights](#highlights)
- [Stack](#stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Common Commands](#common-commands)
- [Project Layout](#project-layout)
- [API Client & Codegen](#api-client--codegen)
- [Authentication](#authentication)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Why this boilerplate?

Most Next.js starters stop at "hello world + Tailwind". This one ships the parts you actually rewrite on every project that talks to an external backend:

- **All client API traffic is proxied through Next** (`app/api/[...path]/route.ts`) so the backend URL never reaches the browser, cookies live on the FE origin, and CORS becomes a non-problem.
- **Cookie-based Better Auth** wired end-to-end — same session works in browser, server components, route handlers, and the proxy (Next 16's `proxy.ts`). No JWT, no refresh-token plumbing.
- **Codegen-friendly api-client package** — point Orval at the backend's OpenAPI spec for typed React Query hooks, or skip it entirely and write hooks by hand. Both modes coexist in `packages/api-client`.
- **shadcn/ui in a separate workspace package** (`@workspace/ui`) — drop new components in once, consume from every app, no duplication.
- **i18n that survives SSR** — next-intl with `[locale]` segments, `vi` default + `en`, locale switcher that preserves the current path.
- **Strict TypeScript everywhere** — `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, plus typecheck gated on every pre-commit.
- **Production Docker image** built with `output: "standalone"`, multi-stage Alpine, non-root user, host/port-agnostic (no public URL baked in).
- **Real tests, not snapshots** — Vitest + RTL + MSW for unit/integration, Playwright for E2E, both wired into CI.
- **DX guards** — Husky + lint-staged + commitlint + Changesets + Knip + Syncpack, all enforced before code reaches `main`.

If you've ever shipped a Next.js app that consumes a non-trivial backend, you've written this glue already. Now you don't have to.

## Highlights

- **One Turborepo, three apps + shared packages** — `apps/app` · `apps/landing` · `apps/admin` (Next.js) share `@workspace/ui` (shadcn) and `@workspace/api-client` (HTTP + hooks). Trim what you don't need with `pnpm remove-app <name>`.
- **Same-origin proxy** — browser hits `/api/*`, Next forwards to `BACKEND_URL`. Backend URL is server-only env, never exposed to the bundle.
- **Better Auth client + server helpers** — `useSession()` in the browser, `getServerSession()` in RSC, `proxy.ts` guard for protected routes.
- **TanStack Query + Devtools** — server + browser QueryClient with dehydration for streaming RSC.
- **Type-safe env** — `@t3-oss/env-nextjs` + Zod, validated on boot, fails fast if anything is missing.
- **Forms** — React Hook Form + Zod resolvers wrapped in shadcn `<Form />` components.
- **State** — Zustand with `persist` middleware and SSR-safe hydration helper.
- **Structured logging** — Pino on the server with cookie/authorization redaction, pretty output in dev.
- **i18n** — next-intl, `vi` default + `en`, `[locale]` route segment, locale-aware navigation.
- **Test stack** — Vitest 4 + React Testing Library + MSW for unit/integration, Playwright 1.60 for E2E (3 browsers).
- **DX** — Husky `pre-commit` (lint-staged + typecheck), `commit-msg` (commitlint), `pre-push` (tests).
- **Self-host Docker** — standalone build, multi-stage, healthcheck, host-agnostic client bundle.
- **CI/CD** — GitHub Actions: lint + typecheck + unit + build (`ci.yml`), Playwright (`e2e.yml`), Changesets (`release.yml`).
- **Auto-updates** — Renovate config with weekly schedule, automerge minor/patch, pinned framework majors.

## Stack

| Layer            | Technology                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| Runtime          | Node.js 20+, pnpm 10.33, TypeScript 5.9                                 |
| Framework        | Next.js 16 (App Router, RSC, Server Actions, standalone output)         |
| UI library       | React 19 + shadcn/ui + Radix UI primitives                              |
| Styling          | Tailwind CSS 4 + tw-animate-css + `next-themes`                         |
| Icons            | lucide-react                                                            |
| Forms            | React Hook Form + Zod + `@hookform/resolvers`                           |
| HTTP client      | Axios 1.x with custom mutator + cancellation                            |
| Server state     | TanStack Query 5 + Devtools                                             |
| Client state     | Zustand 5 (persist middleware)                                          |
| API codegen      | Orval 8 → `packages/api-client/src/generated/` (optional, opt-in)       |
| Authentication   | Better Auth 1.6 (cookie sessions, shared with backend)                  |
| i18n             | next-intl 4 (`vi` default, `en`)                                        |
| Env validation   | `@t3-oss/env-nextjs` + Zod                                              |
| Toast / overlays | Sonner + Radix Tooltip                                                  |
| Logging          | Pino + pino-pretty (server only)                                        |
| Test runner      | Vitest 4 + React Testing Library + jsdom + MSW                          |
| E2E              | Playwright 1.60 (Chromium · Firefox · WebKit)                           |
| Monorepo         | Turborepo 2 (env-aware caching, task graph)                             |
| Package manager  | pnpm 10 workspaces                                                      |
| Lint / format    | ESLint 9 + typescript-eslint + Prettier 3 + prettier-plugin-tailwindcss |
| Git hygiene      | Husky + lint-staged + commitlint (Conventional Commits) + Changesets    |
| Repo health      | Knip (unused exports) + Syncpack (dep version consistency)              |
| Container        | Multi-stage Alpine, non-root, standalone Next output, host-agnostic     |
| CI / CD          | GitHub Actions + Renovate                                               |

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
│  axios baseURL = "" + path "/api/v1/users"                               │
│  better-auth baseURL = window.location.origin + "/api/auth"              │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ same-origin (cookie auto-attached)
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           apps/app (Next.js 16)                          │
│                                                                          │
│  proxy.ts             ← auth gate (session cookie) + i18n locale         │
│  app/[locale]/...     ← App Router, RSC, Server Actions                  │
│  app/api/[...path]/   ← catch-all proxy → BACKEND_URL                    │
│  lib/auth-server.ts   ← getServerSession() (RSC direct fetch)            │
│  lib/query-client.ts  ← TanStack Query (server + browser singleton)      │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ BACKEND_URL (server-only env)
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       NestJS backend (separate repo)                     │
│  /api/auth/*    ← Better Auth (sign-in, sign-up, sessions, OAuth…)       │
│  /api/v1/*      ← domain endpoints                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

**Why proxy everything?**

- Backend URL is server-only env — not embedded in the client bundle.
- Cookies are issued on the **frontend** origin → no SameSite / cross-site cookie dance.
- No CORS configuration on the backend (the only client is the Next.js server).
- Rate-limit, log, or rewrite at the proxy layer if needed later.

## Quick Start

> **Prerequisites** — Node.js 20+, pnpm 10.33+ (`corepack enable && corepack prepare pnpm@10.33.4 --activate`), Docker 24+ (for production image).

```bash
git clone https://github.com/chuanghiduoc/next-monorepo-turbo.git
cd next-monorepo-turbo
pnpm install

# Copy env and point at your backend (repeat per app you keep)
cp apps/app/.env.example apps/app/.env.local
# edit apps/app/.env.local — BACKEND_URL=http://localhost:4000

pnpm dev
```

`pnpm dev` runs every app in parallel on its own port.

| App / Surface | URL                                             |
| ------------- | ----------------------------------------------- |
| app (user)    | <http://localhost:3000>                         |
| landing       | <http://localhost:3001>                         |
| admin         | <http://localhost:3002>                         |
| API proxy     | <http://localhost:3000/api/*> → `BACKEND_URL/*` |
| Vietnamese    | <http://localhost:3000/> (default locale)       |
| English       | <http://localhost:3000/en>                      |
| Locale-aware  | `/dashboard` (vi) · `/en/dashboard` (en)        |

## Common Commands

```bash
# Workspace
pnpm dev                            # turbo dev (Turbopack, all apps)
pnpm build                          # production build for every package
pnpm lint                           # eslint, --max-warnings 0 enforced via lint-staged
pnpm typecheck                      # strict tsc across the monorepo
pnpm test                           # vitest run (unit + integration)
pnpm test:e2e                       # playwright (3 browsers — install first)

# Single app / package
pnpm --filter app dev               # next dev only (app | landing | admin)
pnpm --filter @workspace/ui build   # build a single package
pnpm --filter app exec playwright install   # one-time browser install

# Boilerplate — drop an app you don't need (cleans knip / changeset / compose)
pnpm remove-app landing             # or: admin, app

# API codegen (consumes the live spec)
pnpm codegen                                       # orval → packages/api-client/src/generated/
BACKEND_URL=https://api.example.com pnpm codegen   # override target

# Repo health
pnpm knip                           # find unused exports / dependencies
pnpm syncpack:check                 # detect version mismatches
pnpm syncpack:fix                   # auto-fix mismatches

# Releases
pnpm changeset                      # record a changeset
pnpm changeset:version              # bump versions, write changelog
pnpm changeset:publish              # publish to npm (CI only)

# Docker
docker compose up -d --build app     # build + run one service (app | landing | admin)
docker compose up -d --build         # build + run all three
APP_PORT=8080 docker compose up -d   # change exposed port (no rebuild required)
docker compose down                  # stop and remove
```

## Project Layout

```
.
├── apps/                            # three Next.js apps sharing the packages below
│   ├── app/                         # user app (:3000) — full boilerplate
│   ├── landing/                     # marketing site (:3001)
│   └── admin/                       # admin panel (:3002)
│       # every app has the same shape:
│       ├── app/
│       │   ├── [locale]/             # next-intl segment (vi default + en)
│       │   │   ├── (auth)/           # login, register — public group
│       │   │   └── (app)/            # dashboard — protected group
│       │   └── api/[...path]/        # catch-all proxy → backend
│       ├── components/               # providers, hydration, locale switcher
│       ├── i18n/                     # next-intl routing + navigation
│       ├── lib/
│       │   ├── auth-client.ts        # browser better-auth client
│       │   ├── auth-server.ts        # RSC session helper
│       │   ├── env.ts                # @t3-oss/env-nextjs + zod
│       │   ├── logger.ts             # pino (server only)
│       │   ├── query-client.ts       # TanStack Query factory
│       │   ├── stores/               # zustand stores
│       │   └── validation/           # shared zod schemas
│       ├── messages/                 # next-intl translations (vi, en)
│       ├── proxy.ts                  # auth + i18n (Next 16: was middleware.ts)
│       ├── tests/
│       │   ├── unit/                 # vitest + RTL + MSW
│       │   ├── e2e/                  # playwright
│       │   └── mocks/                # MSW handlers
│       ├── Dockerfile                # multi-stage standalone build
│       ├── next.config.ts            # output: "standalone" + next-intl plugin
│       ├── playwright.config.ts
│       └── vitest.config.ts
│
├── packages/
│   ├── ui/                           # @workspace/ui — shadcn components + tailwind v4
│   ├── api-client/                   # @workspace/api-client
│   │   ├── src/
│   │   │   ├── generated/            # Orval output (gitignored)
│   │   │   ├── hooks/                # handwritten react-query hooks
│   │   │   ├── lib/axios-instance.ts # custom mutator
│   │   │   └── types/                # shared types
│   │   └── orval.config.ts
│   ├── eslint-config/                # shared ESLint config
│   └── typescript-config/            # shared tsconfig presets
│
├── .changeset/                       # changesets config + queued changes
├── .github/workflows/                # ci.yml, e2e.yml, release.yml
├── .husky/                           # pre-commit, commit-msg, pre-push
├── commitlint.config.js
├── docker-compose.yml
├── knip.json
├── renovate.json
├── .syncpackrc.json
└── turbo.json                        # env-aware task graph
```

## API Client & Codegen

`packages/api-client` supports **two modes** that coexist freely:

### 1. Generated (recommended when the backend has OpenAPI)

If your backend exposes a Swagger/OpenAPI spec, point Orval at it and get fully typed React Query hooks:

```bash
BACKEND_URL=http://localhost:3000 pnpm codegen
# emits packages/api-client/src/generated/{auth,users,...}/
```

```tsx
import { useGetUsersMe } from "@workspace/api-client/generated"

const { data: me } = useGetUsersMe()
```

`packages/api-client/orval.config.ts` is wired to use the project's custom axios instance, so generated requests automatically:

- Hit the same-origin Next proxy.
- Forward cookies (`withCredentials: true`).
- Redirect to `/login` on 401.

### 2. Handwritten

If the backend has no spec, or you just want one-off endpoints, drop a hook in `packages/api-client/src/hooks/`:

```ts
// packages/api-client/src/hooks/use-projects.ts
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../lib/axios-instance.js"

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      apiClient.get<Project[]>("/api/v1/projects").then((r) => r.data),
  })
```

The two modes share the same axios instance, error type, and cancellation behavior.

## Authentication

Better Auth is consumed entirely from the FE — the backend owns the auth surface:

| Where              | What                                           |
| ------------------ | ---------------------------------------------- |
| Browser            | `authClient.signIn.email()` etc.               |
| RSC / layout       | `await getServerSession()` in `auth-server.ts` |
| Route handlers     | Same `getServerSession()` (server-only)        |
| Proxy (`proxy.ts`) | Cookie presence check, redirect to `/login`    |

`authClient` uses `window.location.origin` at runtime so the same Docker image works on any host/port. The server helper hits the backend directly (skips the proxy) with the inbound `Cookie` header forwarded.

## Internationalization

`apps/app/i18n/` configures next-intl with `vi` as the default locale and `en` as the secondary.

```
/               → vi (no prefix, default)
/en             → en
/dashboard      → vi dashboard
/en/dashboard   → en dashboard
```

`<LocaleSwitcher />` (`apps/app/components/locale-switcher.tsx`) preserves the current path when switching.

Add a new locale:

1. Append it to `routing.locales` in `apps/app/i18n/routing.ts`.
2. Create `apps/app/messages/<locale>.json`.
3. Add the label to `LABELS` in the switcher.

## Testing

| Layer       | Tool                         | Where                              |
| ----------- | ---------------------------- | ---------------------------------- |
| Unit        | Vitest 4 + RTL + jsdom       | `apps/app/tests/unit/*.test.tsx`   |
| Integration | Vitest + MSW                 | same — backend mocked via handlers |
| E2E         | Playwright 1.60 (3 browsers) | `apps/app/tests/e2e/*.spec.ts`     |

```bash
pnpm test                            # vitest run
pnpm --filter app test:watch         # vitest watch
pnpm --filter app test:coverage      # coverage report

pnpm --filter app exec playwright install   # one-time
pnpm test:e2e                        # all browsers, headless
pnpm --filter app test:e2e:ui        # interactive
```

MSW handlers live in `apps/app/tests/mocks/handlers.ts` and are shared between unit tests and the optional in-browser dev mode.

## Deployment

The image is built with `output: "standalone"` — everything needed at runtime (minimal `node_modules`, the compiled server, static assets) is copied into a single layer.

```bash
docker compose up -d --build app     # builds + serves :3000 (app | landing | admin)
APP_PORT=8080 docker compose up -d   # rebind without rebuilding
```

The client bundle is **port-agnostic**: `axios` and `better-auth/react` resolve their base URLs against `window.location.origin` at runtime, so the same image deploys to any domain without a rebuild.

The container exposes a healthcheck at `/api/v1/health` (proxied to the backend). If you want to terminate TLS in front of Next, drop in Cloudflare, Traefik, Caddy, or an nginx sidecar — the standalone server is reverse-proxy friendly.

## Continuous Integration

Three workflows live in `.github/workflows/`:

| Workflow      | Triggers            | What it runs                                      |
| ------------- | ------------------- | ------------------------------------------------- |
| `ci.yml`      | push / PR to `main` | install → lint → typecheck → unit tests → build   |
| `e2e.yml`     | push / PR to `main` | Playwright (Chromium · Firefox · WebKit) + report |
| `release.yml` | push to `main`      | Changesets — opens a release PR or publishes      |

Turbo cache is keyed per-job; remote cache is intentionally not required for the boilerplate.

Renovate (`renovate.json`) opens dep update PRs weekly, auto-merging minor/patch and pinning React/Next/TS/Turbo majors.

## Contributing

Contributions are very welcome — bug reports, feature requests, and pull requests. Please:

1. Fork → feature branch from `main`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint (`feat:`, `fix:`, `refactor:`, `docs:`, …).
3. Husky runs `lint-staged + typecheck` on commit and `vitest` on push.
4. CI must be green: lint, typecheck, unit, build, E2E.
5. Open a PR — describe the _why_, link the issue, include a test plan.

## Acknowledgements

Built on the work of these open-source projects — please consider supporting them:

- [Next.js](https://nextjs.org/) · [React](https://react.dev/) · [Turborepo](https://turbo.build/)
- [shadcn/ui](https://ui.shadcn.com/) · [Radix UI](https://www.radix-ui.com/) · [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) · [Zustand](https://github.com/pmndrs/zustand) · [React Hook Form](https://react-hook-form.com/) · [Zod](https://zod.dev/)
- [Better Auth](https://www.better-auth.com/) · [next-intl](https://next-intl.dev/) · [Orval](https://orval.dev/) · [Axios](https://axios-http.com/)
- [Vitest](https://vitest.dev/) · [Testing Library](https://testing-library.com/) · [Playwright](https://playwright.dev/) · [MSW](https://mswjs.io/)
- [Pino](https://getpino.io/) · [Sonner](https://sonner.emilkowal.ski/) · [lucide](https://lucide.dev/)
- [Husky](https://typicode.github.io/husky/) · [Changesets](https://github.com/changesets/changesets) · [Knip](https://knip.dev/) · [Syncpack](https://jamiemason.github.io/syncpack/)

## License

Released under the [MIT License](LICENSE) — see the file for details.

<p align="center">
  <sub>Built with care by <a href="https://github.com/chuanghiduoc">@chuanghiduoc</a> · If this saved you a week of plumbing, give it a ⭐</sub>
</p>
