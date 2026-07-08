# Logging & Error Handling

Two concerns, split by side of the wire:

- **Server logging** — **Pino**, server-only, with secret redaction. Structured
  JSON in prod, pretty in dev. Never imported into client code.
- **Errors** — React error boundaries per layer (`error.tsx`, `global-error.tsx`),
  the proxy's `502` on upstream failure, and `sonner` toasts for user-facing
  client errors.

> Files: `apps/<app>/lib/logger.ts`, `app/[locale]/error.tsx`,
> `app/global-error.tsx`, `app/api/[...path]/route.ts`.

---

## 1. The logger

`apps/<app>/lib/logger.ts`:

```ts
import "server-only"
import { pino } from "pino"
import { env } from "@/lib/env"

const isDev = env.NODE_ENV === "development"

export const logger = pino({
  level: env.LOG_LEVEL ?? "info",
  base: { service: "app" },
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname,service",
        },
      }
    : undefined, // prod → raw JSON to stdout for log collectors
})
```

Four things that matter:

1. **`import "server-only"`** — importing `logger` into a `"use client"` file is a
   **build error**. Pino is a Node logger; it must never reach the bundle. This is
   the single most important rule in this guide.
2. **`level` from `env.LOG_LEVEL`** — control verbosity per environment without a
   code change ([env-and-config.md](./env-and-config.md)).
3. **`redact`** — `cookie`, `authorization`, any `*.password`/`*.token` are
   replaced with `[REDACTED]`. Secrets never hit the logs even if you log a whole
   request object.
4. **`transport`** — pretty/colorized in dev; **plain JSON to stdout in prod** so
   a log collector (Docker, Loki, CloudWatch) can parse it. Don't add a file
   transport — containers log to stdout.

---

## 2. Using the logger

Structured logging: **an object first, then a message.** This keeps logs
queryable (`status=502`) instead of trapped in a formatted string:

```ts
import { logger } from "@/lib/logger"

logger.info({ userId, projectId }, "project created")
logger.warn({ path, retries }, "upstream slow, retrying")
logger.error({ path, method, err }, "proxy upstream failed")
```

Levels, in order: `fatal > error > warn > info > debug > trace`. Anything below
`LOG_LEVEL` is dropped.

| Level           | Use for                                                           |
| --------------- | ----------------------------------------------------------------- |
| `error`         | a failed operation you can act on (upstream down, unhandled path) |
| `warn`          | recoverable/degraded (retry, fallback taken)                      |
| `info`          | notable lifecycle events (request handled, job done)              |
| `debug`/`trace` | dev diagnostics — off in prod by default                          |

Pass the caught error as **`err`** (`{ err: error }`) — Pino has a serializer for
that key that expands stack/message. **Never** log a raw secret; if you must log a
value that might contain one, nest it under a redacted path.

---

## 3. Logging in the proxy — the reference pattern

`app/api/[...path]/route.ts` shows the intended shape (fail loud, log context,
never leak topology):

```ts
const logPath = `/api/${path.join("/")}` // sanitized — no backend host, no query string

try {
  upstream = await fetch(target, init)
} catch (error) {
  logger.error({ path: logPath, method, err: error }, "proxy upstream failed")
  return NextResponse.json({ message: "Bad gateway" }, { status: 502 })
}

logger.debug(
  {
    path: logPath,
    method,
    status: upstream.status,
    durationMs: Date.now() - startedAt,
  },
  "proxy"
)
```

Copy these habits:

- **Log a sanitized path**, not the backend URL or query string — those carry
  internal topology and PII.
- **Fail loud with a specific status** (`502` for a dead upstream), never swallow.
- **Return a generic client message** (`"Bad gateway"`) while logging the real
  cause server-side — details go to logs, not to the user.

---

## 4. Error boundaries — the layers

Next.js error handling is layered; each file catches a different scope
([system-architecture.md §10](../system-architecture.md)):

| File                     | Scope   | Notes                                                        |
| ------------------------ | ------- | ------------------------------------------------------------ |
| `[locale]/loading.tsx`   | segment | skeleton while streaming                                     |
| `[locale]/error.tsx`     | segment | client boundary with `reset()`                               |
| `[locale]/not-found.tsx` | locale  | localized 404                                                |
| `app/global-error.tsx`   | root    | replaces the layout — **own `<html>/<body>`**, inline styles |
| `app/not-found.tsx`      | root    | non-localized 404                                            |

**Segment boundary** `app/[locale]/error.tsx` — a client component that catches
render/data errors below the locale layout:

```tsx
"use client"
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error) // surface to monitoring; `digest` correlates with server logs
  }, [error])
  return (
    <div /* styled with tokens */>
      <h1>Something went wrong</h1>
      {error.digest ? <code>{error.digest}</code> : null}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

- **`reset()`** re-renders the segment — the user retries without a full reload.
- **`error.digest`** is Next's hash that ties the client error to the server log
  entry (prod strips the real message from the client for security). Show the
  digest so a user can quote it to support; grep it server-side to find the cause.

**Root boundary** `app/global-error.tsx` — catches errors in the root layout
itself. Because it _replaces_ the layout, it renders its **own `<html>`/`<body>`
with inline styles** — it can't assume app CSS or fonts loaded:

```tsx
"use client"
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={
          {
            /* inline — no app styles guaranteed */
          }
        }
      >
        <h1>Something went wrong</h1>
        {/* digest + reset button */}
      </body>
    </html>
  )
}
```

---

## 5. Client-facing errors — toasts

For expected, recoverable client errors (a failed login, a rejected mutation),
don't throw to a boundary — show a **`sonner` toast** and let the user retry
in place:

```tsx
const { error } = await signIn.email(values)
if (error) {
  toast.error(error.message ?? t("auth.signInFailed"))
  return
}
```

```tsx
const { mutate } = useCreateProject({
  onError: (e) => toast.error(e.response?.data?.message ?? t("common.error")),
})
```

**Boundary vs toast:**

| Situation                                                       | Handle with                                                                            |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Unexpected render/data crash                                    | `error.tsx` boundary (`reset()` retry)                                                 |
| Expected, recoverable action failure (401, validation, network) | `toast.error`                                                                          |
| Root layout crash                                               | `global-error.tsx`                                                                     |
| Field-specific validation                                       | `FormMessage` / `form.setError` ([forms-and-validation.md](./forms-and-validation.md)) |

The `<Toaster />` is mounted once in the locale layout; `toast.*` works from any
client component.

---

## 6. The 401 → login interceptor

Auth-expiry is handled globally, not per call — the axios interceptor
([data-fetching.md](./data-fetching.md)) redirects to `/login` on any `401` so you
never write "session expired" handling in components:

```ts
if (error.response?.status === 401 && typeof window !== "undefined") {
  // window.location.replace(`/login?next=<safe-current-path>`)
}
```

---

## 7. Do / Don't

**Do**

- Log with `logger.<level>({ context }, "message")` — object first.
- Keep `logger` server-only; it must never enter a client component.
- Redact/omit secrets and internal URLs from logs (the redact list + sanitized paths).
- Fail loud with a specific status; log the cause, return a generic message.
- Show `error.digest` to users and grep it server-side.
- Use toasts for recoverable client errors, boundaries for crashes.

**Don't**

- Don't `import { logger }` in `"use client"` code — build error, and rightly so.
- Don't log raw request objects without the redact config (leaks cookies/tokens).
- Don't swallow errors silently — no empty `catch {}` that hides failures.
- Don't leak the backend host/query string into logs or client responses.
- Don't throw to an error boundary for an expected 401/validation failure — toast it.

---

## Related

- [data-fetching.md](./data-fetching.md) — the proxy, the 401 interceptor, `ApiError`.
- [env-and-config.md](./env-and-config.md) — `LOG_LEVEL`, `NODE_ENV`.
- [forms-and-validation.md](./forms-and-validation.md) — field-level vs toast errors.
- [system-architecture.md §10](../system-architecture.md) — the error/loading file map.
