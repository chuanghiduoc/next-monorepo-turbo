# Development Guides

Task-oriented "how to build X in this repo" guides. Where
[`system-architecture.md`](../system-architecture.md) explains **what the stack
is and where code lives**, and [`code-standards.md`](../code-standards.md) is the
**day-to-day rulebook**, these guides show **how to use each library the way
this codebase already uses it** — with snippets lifted from real files, not
generic library docs.

> Read the architecture doc first. Every guide assumes you know the three-app
> layout, the `/api/*` proxy, and the Server-vs-Client rendering model.

## Index

| Guide                                                | Covers                                                                                               | Key files it documents                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [data-fetching.md](./data-fetching.md)               | TanStack Query: queries, mutations, keys, retry policy, SSR hydration, writing hooks in `api-client` | `lib/query-client.ts`, `components/query-provider.tsx`, `packages/api-client` |
| [forms-and-validation.md](./forms-and-validation.md) | Zod schemas + React Hook Form + `zodResolver` + `@workspace/ui` `<Form>`                             | `lib/validation/*`, `(auth)/login`, `(auth)/register`                         |
| [auth.md](./auth.md)                                 | Better Auth across browser / RSC / proxy, cookie sessions, `PREVIEW_AUTH`                            | `lib/auth-client.ts`, `lib/auth-server.ts`, `proxy.ts`                        |
| [state-management.md](./state-management.md)         | Zustand for local UI state; when to use a store vs Query vs React state                              | `lib/stores/ui-store.ts`                                                      |
| [env-and-config.md](./env-and-config.md)             | Type-safe env with `@t3-oss/env-nextjs` + Zod, server vs client vars, Turbo wiring                   | `lib/env.ts`, `turbo.json`, `next.config.ts`                                  |
| [i18n.md](./i18n.md)                                 | next-intl: messages, `useTranslations`/`getTranslations`, locale-aware navigation                    | `i18n/*`, `messages/*`, `proxy.ts`                                            |
| [testing.md](./testing.md)                           | Vitest + RTL + MSW (unit), Playwright (e2e), shared test utils                                       | `vitest.config.ts`, `tests/**`                                                |
| [logging-and-errors.md](./logging-and-errors.md)     | Pino (server-only, redacted), error boundaries, client toasts, proxy failures                        | `lib/logger.ts`, `error.tsx`, `global-error.tsx`                              |

## How to read a guide

Each guide follows the same shape:

1. **When to reach for it** — the decision, not the API.
2. **The repo's pattern** — the canonical way it's already done here.
3. **Real snippets** — copied from the file named above each block.
4. **A worked example** — an end-to-end feature you can copy.
5. **Do / Don't** — the mistakes this stack punishes.

## Conventions shared by every guide

- All three apps (`app`, `admin`, `landing`) carry **copies** of these `lib/`
  files. A pattern shown for `apps/app` applies verbatim to the others — fix a
  bug in one, port it to all three.
- Client code never sees `BACKEND_URL`; it only calls `/api/*`. See
  [data-fetching.md](./data-fetching.md) and [auth.md](./auth.md).
- Server-only modules (`logger`, `auth-server`) import `"server-only"` — never
  import them from a `"use client"` file.
