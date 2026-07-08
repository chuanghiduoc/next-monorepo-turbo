# Environment & Config — type-safe env with Zod

Environment variables in this repo are **validated on boot** with
`@t3-oss/env-nextjs` + Zod. A missing or malformed var fails the build/start with
a clear error instead of surfacing as `undefined` at runtime. The same schema
enforces the **server-only vs client-exposed** split that keeps `BACKEND_URL` out
of the browser.

> Canonical file: `apps/<app>/lib/env.ts`. Turbo declares which vars each task
> sees in `turbo.json`; Next validates on import via `next.config.ts`.

---

## 1. Why not just `process.env`?

`process.env.FOO` is `string | undefined`, unvalidated, and available everywhere
— including the browser bundle if you're not careful. This repo replaces it with
a typed `env` object so that:

- a **missing** required var throws **at boot**, not on the first request;
- values are **typed** (`NODE_ENV` is `"development" | "test" | "production"`,
  not `string`);
- **server secrets can't leak** — referencing a server var in client code is a
  build-time error.

---

## 2. The env schema

`apps/<app>/lib/env.ts`:

```ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    BACKEND_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
})
```

The four blocks:

| Block        | Meaning                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `server`     | server-only vars. Reading `env.BACKEND_URL` from a client file **throws at build**.                              |
| `client`     | browser-exposed vars. **Must** be prefixed `NEXT_PUBLIC_` — the lib enforces it.                                 |
| `runtimeEnv` | maps each key to `process.env.KEY`. Required because bundlers only inline statically-referenced `process.env.*`. |
| flags        | `emptyStringAsUndefined` treats `""` as missing; `skipValidation` is the CI/Docker escape hatch.                 |

---

## 3. The server / client rule (the important one)

```
env.BACKEND_URL          → server only. In a "use client" file → BUILD ERROR.
env.NEXT_PUBLIC_APP_URL  → safe anywhere (it's in the bundle by design).
```

This is the mechanism behind [system-architecture.md §5](../system-architecture.md):
the browser never learns `BACKEND_URL`. You don't enforce it by discipline — the
`server`/`client` split enforces it for you. Two consequences:

- **Never** put a secret under `client` or prefix it `NEXT_PUBLIC_` — anything
  there ships to every visitor.
- If you need a backend value in the browser, you almost always don't — route the
  request through `/api/*` instead (see [data-fetching.md](./data-fetching.md)).

---

## 4. Adding a new variable

1. **Add it to the schema** under `server` or `client` in `lib/env.ts`, with a
   Zod type (`z.string().url()`, `z.coerce.number()`, `z.enum([...])`, …).
2. **Map it in `runtimeEnv`** — `MY_VAR: process.env.MY_VAR`. Skipping this is the
   #1 mistake; the var will read as `undefined` even though it's set.
3. **Declare it in `turbo.json`** for every task that reads it (see §5), or Turbo
   won't pass it through and cache keys will be wrong.
4. **Document it** in `.env.example` (never commit `.env*` with real values).
5. **Use `env.MY_VAR`** — never `process.env.MY_VAR` — so you get the typed,
   validated value.

Example — adding an optional analytics key exposed to the browser:

```ts
client: {
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
},
runtimeEnv: {
  // …existing…
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
},
```

---

## 5. Turbo wiring — why `turbo.json` lists env vars

Turborepo hashes declared env vars into the **cache key** so a build with
different env produces a different cache entry. If a var isn't declared, Turbo may
serve a stale cached build that baked in the wrong value.

From `turbo.json`:

```jsonc
{
  "globalEnv": ["NODE_ENV", "SKIP_ENV_VALIDATION", "PREVIEW_AUTH"],
  "globalPassThroughEnv": ["CI"],
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_APP_URL", "BACKEND_URL", "LOG_LEVEL"],
      // …
    },
    "typecheck": { "env": ["NEXT_PUBLIC_APP_URL", "BACKEND_URL", "LOG_LEVEL"] },
  },
}
```

| Field                  | Use                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| `globalEnv`            | vars affecting **every** task's cache (`NODE_ENV`, `PREVIEW_AUTH`).     |
| `task.env`             | vars a **specific** task depends on — add your new build-time var here. |
| `globalPassThroughEnv` | vars passed through **without** affecting the cache key (`CI`).         |

**Rule:** a new build-time var goes in the relevant `task.env` (usually `build`,
`typecheck`, `test`). A runtime-only var (read at request time, not build) doesn't
change build output and can be passed through instead.

---

## 6. Validation on boot

`next.config.ts` imports the schema so validation runs before the app starts:

```ts
import "./lib/env" // ← throws here if a required var is missing/malformed
```

So a bad env fails `pnpm build`/`pnpm dev` immediately with a Zod error naming the
offending key — not a mysterious `undefined` three screens deep.

**`SKIP_ENV_VALIDATION=1`** bypasses validation. Use it only where env genuinely
isn't available yet — e.g. a Docker image build stage that receives real env at
`docker run`, or a lint/typecheck step that doesn't need runtime values. Never in
a running production app.

---

## 7. `PREVIEW_AUTH` — a config-driven feature flag

`PREVIEW_AUTH` (in `turbo.json → globalEnv`) is the pattern for a **dev-only
behavior switch**: read `process.env.PREVIEW_AUTH === "1"` where it's needed
(`auth-server.ts`, `proxy.ts`), default off. It bypasses auth so designers can
browse protected pages without a backend — see [auth.md §7](./auth.md).

> It's read via `process.env` (not the typed `env`) because it's an optional
> dev-time toggle rather than a required runtime input. That's a deliberate
> exception; required inputs go through the schema.

---

## 8. The variables today

| Var                   | Scope        | Type  | Purpose                                                             |
| --------------------- | ------------ | ----- | ------------------------------------------------------------------- |
| `NODE_ENV`            | server       | enum  | `development` / `test` / `production`                               |
| `LOG_LEVEL`           | server       | enum  | Pino level ([logging-and-errors.md](./logging-and-errors.md))       |
| `BACKEND_URL`         | server       | url   | upstream the `/api/*` proxy forwards to — **secret to the browser** |
| `NEXT_PUBLIC_APP_URL` | client       | url   | this app's own origin; axios base URL on the server                 |
| `PREVIEW_AUTH`        | global (opt) | `"1"` | dev auth-bypass flag                                                |
| `SKIP_ENV_VALIDATION` | global (opt) | `"1"` | skip Zod validation (build stages only)                             |

---

## 9. Do / Don't

**Do**

- Add every var to the schema **and** `runtimeEnv`.
- Declare build-time vars in the right `turbo.json → task.env`.
- Read values through `env.*`, never raw `process.env.*` (except documented dev flags).
- Keep secrets under `server`; keep `.env*` out of git.
- Give client-safe values the `NEXT_PUBLIC_` prefix.

**Don't**

- Don't put a secret under `client` or behind `NEXT_PUBLIC_` — it ships to users.
- Don't forget the `runtimeEnv` mapping — the var silently reads `undefined`.
- Don't leave `SKIP_ENV_VALIDATION=1` set in a running app.
- Don't add a var to `env.ts` but forget `turbo.json` — you'll get stale cached builds.

---

## Related

- [auth.md](./auth.md) — `BACKEND_URL`, `PREVIEW_AUTH`.
- [data-fetching.md](./data-fetching.md) — `NEXT_PUBLIC_APP_URL` as the server axios base.
- [logging-and-errors.md](./logging-and-errors.md) — `LOG_LEVEL`.
