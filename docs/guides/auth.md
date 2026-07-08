# Authentication — Better Auth + cookie sessions

One session, read the same way in four places: the **browser**, **React Server
Components**, **route handlers**, and the **proxy** (Next.js's request
interceptor). Auth is **cookie-based** (Better Auth), same-origin through the
`/api/*` proxy route, so there's no token plumbing and no CORS.

> Files: `apps/<app>/lib/auth-client.ts` (browser), `lib/auth-server.ts` (RSC),
> `proxy.ts` (route gate). Backend URL is server-only — see
> [system-architecture.md §5](../system-architecture.md).

> **Next.js 16 naming:** the request-interceptor file is `proxy.ts` with an
> `export function proxy(...)`. It used to be `middleware.ts` /
> `export function middleware(...)` — that convention is **deprecated in Next 16
> and silently ignored**, so this repo uses `proxy.ts`. Don't confuse it with the
> `/api/[...path]` **proxy route** (a Route Handler) — different thing, same word.
> The codemod for the rename is `npx @next/codemod@canary middleware-to-proxy .`.

---

## 1. The one-session model

```
Browser ─ authClient (/api/auth/*) ─▶ proxy ─▶ BACKEND_URL/api/auth/*
   │ sets better-auth session cookie (same-origin, HttpOnly)
   ▼
RSC ────── getServerSession() ───────────────▶ BACKEND_URL/api/auth/get-session
Proxy ──── hasSessionCookie() (cookie presence only, no network)
```

- The cookie is set on the **frontend origin** (because auth traffic goes through
  the same-origin proxy), so every layer sees it automatically.
- **Browser** talks to `/api/auth/*`; **server** code talks to `BACKEND_URL`
  directly (already past the proxy).

---

## 2. Pick the right reader

| Where you are             | Use                                                 | Returns                        | Notes                                 |
| ------------------------- | --------------------------------------------------- | ------------------------------ | ------------------------------------- |
| Client component          | `useSession()` from `@/lib/auth-client`             | reactive `{ data, isPending }` | re-renders on login/logout            |
| Server component / layout | `await getServerSession()` from `@/lib/auth-server` | `Session \| null`              | React-cached per request              |
| Route handler             | `await getServerSession()`                          | `Session \| null`              | same as RSC                           |
| Proxy (`proxy.ts`)        | `hasSessionCookie(request)`                         | `boolean`                      | cookie presence only — fast, no fetch |

**Rule:** never call `getServerSession()` from client code (it's `server-only`),
and never gate a _render_ on the proxy check (it only knows the cookie
_exists_, not that it's valid).

---

## 3. Client — `useSession`, `signIn`, `signOut`

`apps/<app>/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react"

const baseURL =
  typeof window === "undefined"
    ? "http://localhost/api/auth" // SSR fallback, never actually called
    : `${window.location.origin}/api/auth` // resolved at runtime → host-agnostic

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: "include" }, // send/receive the cookie
})

export const { useSession, signIn, signOut, signUp, getSession } = authClient
```

`baseURL` is `window.location.origin + /api/auth`, so the **same Docker image
runs on any host/port** — nothing is baked in at build time.

**Reading the session in a component:**

```tsx
"use client"
const { data: session, isPending } = useSession()
if (isPending) return <Skeleton className="h-8 w-8 rounded-full" />
if (!session) return <SignInButton />
return <Avatar name={session.user.name} />
```

**Sign in / up** (from the auth forms — see [forms-and-validation.md](./forms-and-validation.md)):

```ts
const { error } = await signIn.email({ email, password })
const { error } = await signUp.email({ name, email, password })
```

**Sign out:**

```tsx
<button onClick={() => signOut().then(() => router.replace("/login"))}>
  {t("common.signOut")}
</button>
```

---

## 4. Server — `getServerSession`

`apps/<app>/lib/auth-server.ts`:

```ts
import "server-only"
import { headers } from "next/headers"
import { cache } from "react"

export const getServerSession = cache(async (): Promise<Session | null> => {
  if (process.env.PREVIEW_AUTH === "1") return PREVIEW_SESSION // dev escape hatch

  const cookie = (await headers()).get("cookie") ?? ""
  try {
    const res = await fetch(`${env.BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie, accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as Session | null
    return data && data.user ? data : null
  } catch {
    return null
  }
})
```

Why it's shaped this way:

- **`import "server-only"`** — importing this from a client file is a build error.
  That's the guardrail keeping `BACKEND_URL` out of the bundle.
- **`cache()`** (React, not Next) — many RSCs in one request share **one**
  backend round-trip instead of each re-fetching the session.
- **Forwards the incoming `cookie`** header so the backend can identify the user.
- **`cache: "no-store"`** — session is never statically cached.
- **Fails closed** — any error or a missing `user` returns `null` (treated as
  logged out), never throws into the render.

**Guarding a protected page/layout:**

```tsx
// app/[locale]/(app)/layout.tsx  (Server Component)
import { redirect } from "@/i18n/navigation"
import { getServerSession } from "@/lib/auth-server"

export default async function AppLayout({ children }) {
  const session = await getServerSession()
  if (!session) redirect("/login")
  return <AppShell user={session.user}>{children}</AppShell>
}
```

The whole `(app)` route group is protected by this one layout — you don't repeat
the check per page.

---

## 5. Proxy (`proxy.ts`) — the fast gate

`apps/<app>/proxy.ts` runs on every navigation (before RSCs). It does a
**cheap cookie-presence check** to bounce obviously-unauthenticated requests,
then hands off to the next-intl middleware (that helper keeps its own name — it's
a next-intl API, not the Next.js file convention):

```ts
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]
const SESSION_COOKIE_PREFIX = "better-auth"
const PREVIEW_AUTH = process.env.PREVIEW_AUTH === "1"

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith(SESSION_COOKIE_PREFIX) && c.name.includes("session")
    )
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (!PREVIEW_AUTH && !isPublic(pathname) && !hasSessionCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname + search) // remember where they wanted to go
    return NextResponse.redirect(url)
  }
  return intlMiddleware(request)
}
```

Two layers, on purpose:

1. **Proxy** = presence check. Fast, no network. Catches the "no cookie at
   all" case before rendering anything.
2. **Layout `getServerSession()`** = validity check. Confirms the cookie maps to a
   real session with the backend.

A tampered/expired cookie passes the proxy but fails the layout → the layout
redirects. Defense in depth, not redundancy.

The `matcher` excludes `api`, `_next/static`, `_next/image`, and metadata files
so the gate only runs on real pages.

> **Runtime note:** in Next 16 the proxy defaults to the **Node.js runtime** and
> the `runtime` segment config is not allowed inside `proxy.ts` (setting it
> throws). This repo's proxy doesn't set one, so nothing to change — but don't add
> `export const runtime` here.

---

## 6. The `?next=` redirect — and its open-redirect guard

The proxy appends `?next=<original-path>`; the login form reads it back and
sanitizes it (`login/page.tsx`):

```ts
function getSafeNext(raw: string | null): string {
  if (
    raw &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.startsWith("/\\")
  ) {
    return raw
  }
  return "/dashboard"
}
```

This rejects `?next=https://evil.com` and `?next=//evil.com` — only same-origin,
non-protocol-relative paths are honored. **Always** run untrusted redirect
targets through this; never `router.replace(searchParams.get("next"))` raw.

---

## 7. `PREVIEW_AUTH` — browse protected pages without a backend

Design/dev-only escape hatch, off by default:

- `getServerSession()` returns a mock `PREVIEW_SESSION` (no backend call).
- `proxy.ts` skips the redirect entirely.

Enable it in `.env.local` (declared in `turbo.json → globalEnv`):

```bash
PREVIEW_AUTH=1
```

> **Never set this in production.** It disables auth. It exists so designers can
> browse `(app)`/`admin` surfaces before the backend is wired. See
> [env-and-config.md](./env-and-config.md).

---

## 8. Worked example — a "current user" server action-ish flow

**Show the user in the header (server), let them sign out (client):**

```tsx
// components/app-header.tsx  (Server Component — reads session, passes data down)
import { getServerSession } from "@/lib/auth-server"
import { UserMenu } from "./user-menu"

export async function AppHeader() {
  const session = await getServerSession()
  if (!session) return null
  return <UserMenu name={session.user.name} email={session.user.email} />
}
```

```tsx
// components/user-menu.tsx  ("use client" — needs the sign-out handler)
"use client"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "@/i18n/navigation"

export function UserMenu({ name, email }: { name?: string; email: string }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      {/* trigger with name/email... */}
      <DropdownMenuItem
        onClick={() =>
          signOut().then(() => {
            router.replace("/login")
            router.refresh()
          })
        }
      >
        Sign out
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
```

Note the RSC→client boundary: the server reads the session and passes **plain
data** (`name`, `email`) — not the session object or a function — into the client
menu. That's the [code-standards](../code-standards.md) rule about never passing
functions across the boundary.

---

## 9. Session shape

```ts
interface Session {
  user: { id: string; email: string; name?: string; image?: string | null }
  session: { id: string; expiresAt: string }
}
```

If the backend returns more fields, extend this interface in **all three apps'**
`auth-server.ts` (they're copies) and in the Better Auth client types.

---

## 10. Do / Don't

**Do**

- Gate protected renders in the `(app)` layout with `getServerSession()`.
- Use `useSession()` for reactive UI (avatar, menus) in client components.
- `router.refresh()` after sign-in/out so RSCs re-read the session.
- Sanitize every `?next=` target with `getSafeNext`.
- Keep `PREVIEW_AUTH` in `.env.local` only.

**Don't**

- Don't trust the proxy cookie check for authorization — it only proves a
  cookie exists; validate in the layout.
- Don't leave a stale `middleware.ts` behind after renaming to `proxy.ts` — Next
  16 ignores it silently and your auth gate stops running.
- Don't import `auth-server` (or anything `server-only`) into client code.
- Don't hardcode `baseURL` for the auth client — the runtime `window.origin`
  form is what makes the image portable.
- Don't redirect to a raw `next` param.
- Don't set `PREVIEW_AUTH=1` anywhere but local dev.

---

## Related

- [data-fetching.md](./data-fetching.md) — the shared 401 → `/login` interceptor.
- [forms-and-validation.md](./forms-and-validation.md) — the sign-in/up forms.
- [i18n.md](./i18n.md) — the locale-aware `redirect`/`useRouter` used above.
