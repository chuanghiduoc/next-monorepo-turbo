# CLAUDE.md

Guidance for AI agents (and humans) working in this repository. Read this first,
then follow the deep docs it links to. Keep changes minimal, typed, and green.

## What this is

A **Turborepo + pnpm** monorepo boilerplate: three **Next.js 16 / React 19** apps
sharing a **shadcn/ui** design system and a typed **api-client**. The frontend
owns auth cookies and proxies every client request to a separate backend, so the
backend URL never reaches the browser.

- **Product overview & setup:** [`README.md`](./README.md)
- **Architecture & "where code lives":** [`docs/system-architecture.md`](./docs/system-architecture.md)
- **Coding conventions & quality bar:** [`docs/code-standards.md`](./docs/code-standards.md)
- **Step-by-step "how to build a feature":** [`docs/development-guide.md`](./docs/development-guide.md)

## Repo map

```
apps/
  app/       user product dashboard   (:3000, noindex)  ← full boilerplate
  landing/   marketing site + /preview (:3001, indexable)
  admin/     ops/admin console         (:3002, noindex)
packages/
  ui/                @workspace/ui        design system (tokens + shadcn components)
  api-client/        @workspace/api-client HTTP mutator + React Query hooks (+ Orval codegen)
  eslint-config/     shared ESLint flat config
  typescript-config/ shared tsconfig bases
docs/    architecture, code standards, development guide
scripts/ remove-app.mjs — `pnpm remove-app <name>`
```

All three apps share **one** design system. Change a token or primitive in
`packages/ui` and every app updates — never fork component styles per app.

## Commands

```bash
pnpm dev           # all apps in parallel (app :3000 · landing :3001 · admin :3002)
pnpm --filter app dev   # a single app
pnpm lint          # eslint --max-warnings 0
pnpm typecheck     # strict tsc across the workspace
pnpm test          # vitest (unit + integration)
pnpm test:coverage # same, with the coverage thresholds CI enforces
pnpm test:e2e      # playwright against a production build (install browsers first)
pnpm build         # production build (also validates metadata + static gen)
pnpm knip          # unused files / deps
pnpm syncpack:check # dependency version consistency
```

**Before claiming a change is done:** run the same six checks CI does —
`lint`, `typecheck`, `test:coverage`, `build`, `knip`, `syncpack:check`. The
`pre-push` hook runs exactly these, so `sh .husky/pre-push` reproduces the gate
in one command. Fix regressions rather than weakening tests.

A green local run is necessary but not sufficient: builds run with
`SKIP_ENV_VALIDATION=1`, which skips the Zod **defaults** as well as the
validation, and `.env.local` exists locally but not in CI. Watch the CI run
before calling it done.

## Non-negotiables

1. **Server Components by default.** Add `"use client"` only for interactivity,
   browser APIs, charts (recharts), or hooks like `useTranslations` in a widget.
2. **RSC → client boundary:** never pass a function/component (e.g. a lucide icon)
   as a prop from a Server to a Client Component. Put that data inside a small
   `"use client"` wrapper instead (see `components/overview/overview-stats.tsx`).
3. **Backend URL is server-only.** Browser talks only to `/api/*`; never import
   `BACKEND_URL` into client code. Read env via `@/lib/env` (validated with Zod).
4. **Style from semantic tokens** (`bg-brand`, `text-success`, `border-border`),
   never raw hex. Light + dark are paired — don't invert colors by hand.
5. **Fixed app shell — only the content region scrolls.** See architecture §7.
6. **Deterministic data at module scope** — no `Math.random()` / `new Date()`
   (breaks SSR hydration and build caching). Use `Math.sin` over an index.
7. **i18n:** user-facing chrome goes through `messages/{en,vi}.json`; import
   `Link`/`useRouter`/`redirect` from `@/i18n/navigation`, not `next/link`.
8. **Auth:** `getServerSession()` (`@/lib/auth-server`) in RSC, `useSession()`
   (`@/lib/auth-client`) in the browser. `(app)/layout.tsx` guards the session.

## Where to put code

| You are building…                | Put it in…                                         |
| -------------------------------- | -------------------------------------------------- |
| Reusable primitive / new variant | `packages/ui/src/components/` (edit the `cva`)     |
| Feature/page-specific component  | `apps/<app>/components/<feature>/`                 |
| A new protected page             | `apps/<app>/app/[locale]/(app)/<route>/page.tsx`   |
| A backend call                   | through `/api/*`; hooks in `@workspace/api-client` |
| Shared validation schema         | `apps/<app>/lib/validation/`                       |

## Conventions (short list — full rules in `docs/code-standards.md`)

- **Files:** kebab-case `.ts`/`.tsx`. **Components:** PascalCase. **Hooks:** `useThing`.
- **TypeScript strict** with `noUncheckedIndexedAccess` — index access is `T | undefined`.
- Avoid `any`; justify with a comment if truly unavoidable. No dead code / debug logs.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`…), enforced by commitlint. No AI
  references in messages. No plan IDs / phase numbers / audit labels in code or commits.
- Never commit secrets or `.env*`. Add a Changeset for user-facing package changes.

## Guardrails for agents

- Read a file before editing it; keep changes scoped to the request.
- Don't invent APIs — verify against this repo or library docs before using them.
- Don't run destructive git operations (commit/push/PR, force, reset --hard) unless
  explicitly asked.
