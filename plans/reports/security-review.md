# Security Review — next-monorepo-turbo

**Date:** 2026-07-02
**Reviewer:** Staff Engineer (Security Review)
**Scope:** Full codebase — apps/web, packages/api-client, packages/ui
**Standard:** Google-scale production readiness

---

## Score: 5.5 / 10

### Distribution by Severity

| Severity  | Count  |
| --------- | ------ |
| Critical  | 1      |
| High      | 5      |
| Medium    | 5      |
| Low       | 4      |
| **Total** | **15** |

---

## Critical Issues

### C-01 — Unauthenticated Full Proxy to Backend (IDOR / Auth Bypass)

**File:** `apps/web/app/api/[...path]/route.ts`
**Severity:** Critical
**Risk:** Real — exploitable in production today

**Description:**
The middleware matcher at `middleware.ts:54` explicitly excludes `/api` from auth checking:

```
"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
```

The wildcard proxy at `/api/[...path]` forwards **all HTTP methods** (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD) to the backend **without any authentication gate**. Any unauthenticated client can call:

- `POST /api/auth/sign-up/email` — register accounts without restrictions
- `GET /api/v1/admin/users` — if the backend fails to enforce ADMIN role on that endpoint
- `POST /api/v1/upload/*` — upload arbitrary content
- Any endpoint the backend exposes under `/api/*`

The proxy blindly forwards the raw cookie header from the incoming request (`filterRequestHeaders` passes all non-hop-by-hop headers, which includes `cookie`). The backend is the only auth enforcement point. If any backend endpoint has a misconfiguration or is not protected, it is immediately publicly accessible via the Next.js proxy.

**Immediate risk vector:** An attacker visits `https://yourapp.com/api/v1/admin/users` directly. Zero JavaScript. The Next.js server happily proxies it to the backend with no cookie.

**Fix:**
Option A (recommended) — Add auth guard in the proxy route itself:

```typescript
// apps/web/app/api/[...path]/route.ts
import { getServerSession } from "@/lib/auth-server"

async function proxy(request: NextRequest, context: ...) {
  const { path } = await context.params
  // Allow auth endpoints to pass through unauthenticated
  const isAuthEndpoint = path[0] === "auth"
  if (!isAuthEndpoint) {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  }
  // ... rest of proxy logic
}
```

Option B — Move auth middleware to cover `/api` (remove `api` from the matcher exclusion list and handle auth routes carefully).

---

## High Issues

### H-01 — Open Redirect via Unvalidated `next` Parameter

**File:** `apps/web/app/[locale]/(auth)/login/page.tsx:28,45`
**Severity:** High
**Risk:** Real — exploitable for phishing

**Description:**
The login page reads `?next=` from the URL and calls `router.replace(next)` directly after successful login:

```typescript
const next = searchParams.get("next") ?? "/dashboard"
// ...
router.replace(next)
```

The middleware sets this param with internal paths only (`pathname + search`), but the page itself accepts it from any URL query. An attacker can craft:

```
https://yourapp.com/login?next=https://evil.com/steal-session
```

After login, the user is redirected to `https://evil.com`. next-intl's `router.replace` with an external URL will cause a full navigation to the external domain.

**Fix:**

```typescript
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/dashboard"
  try {
    // Allow only relative paths (no protocol/host)
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return "/dashboard"
    return url.pathname + url.search
  } catch {
    // Not a valid URL — check it's a relative path
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard"
  }
}
const next = sanitizeNext(searchParams.get("next"))
```

---

### H-02 — Middleware Auth Based on Cookie Name Only (Forgeable Guard)

**File:** `apps/web/middleware.ts:30-37`
**Severity:** High
**Risk:** Real — middleware protection can be bypassed at the edge

**Description:**
The `hasSessionCookie` function checks only that a cookie **exists** with a name matching `better-auth*session*`:

```typescript
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith("better-auth") && c.name.includes("session"))
}
```

This does not validate the session token. An attacker can bypass the middleware check by sending any cookie named e.g. `better-auth.session.fake` with any value. The middleware will allow them through to the protected app layout, which does call `getServerSession()` (a proper backend check) — so the actual page content is protected.

However, the middleware is the gate for **all non-API routes**. Any route that does NOT call `getServerSession()` in its layout/page (e.g., future routes added without the server check) will be silently exposed. This is a defense-in-depth failure — the middleware provides false security confidence.

**Risk is currently partially mitigated** by `AppLayout` calling `getServerSession()` and redirecting if null. But:

1. Future developers may add routes inside `(app)/` that skip the layout check.
2. Static assets/pages that don't pass through layout will have no protection.

**Fix:**
The middleware cannot validate JWT/session without a database call, which is expensive at the edge. Best practice: add a comment clearly marking this as a "presence check only, not a validity check" and document that every server component inside `(app)/` **must** call `getServerSession()`. Alternatively, use next-auth/better-auth's session token validation utilities that work in middleware.

---

### H-03 — SKIP_ENV_VALIDATION in Dockerfile Build Stage

**File:** `apps/web/Dockerfile:23`
**Severity:** High
**Risk:** Real — env vars not validated at build time, misconfigured deployments will start silently

**Description:**

```dockerfile
ENV SKIP_ENV_VALIDATION=1
RUN pnpm turbo build --filter=web
```

The build stage disables all `@t3-oss/env-nextjs` validation. This is a common pattern to allow builds without runtime secrets, but it means:

1. If a required env var (`BACKEND_URL`, `NEXT_PUBLIC_APP_URL`) is missing at runtime, the app starts without error and crashes at the first request that uses it.
2. The validation safety net that catches misconfigured deployments is completely absent.
3. A `BACKEND_URL` pointing to an unintended host (e.g., internal metadata service) would not be caught.

**Fix:**
Use build args only for `NEXT_PUBLIC_*` vars (which are baked into the bundle). Keep `SKIP_ENV_VALIDATION=1` only during the build step but ensure a separate validation/startup check runs at container start:

```dockerfile
# In runtime CMD or entrypoint, validate required server-only vars:
CMD ["node", "-e", "require('./lib/env'); process.exit(0)"] && node apps/web/server.js
```

Or add a health-check startup probe that fails fast if critical vars are missing.

---

### H-04 — Proxy Leaks Internal `target` URL in Debug Logs

**File:** `apps/web/app/api/[...path]/route.ts:72-80`
**Severity:** High
**Risk:** Real if logs are shipped to external services

**Description:**
The debug log includes the full `target` URL which contains the internal `BACKEND_URL`:

```typescript
logger.debug(
  {
    target, // e.g., http://internal-backend:4000/api/v1/admin/users?search=foo
    method,
    status: upstream.status,
    durationMs: Date.now() - startedAt,
  },
  "proxy"
)
```

In the error path, `target` is also logged at error level. If pino logs are shipped to an external observability platform (Datadog, Grafana Cloud, etc.), the internal network topology (IP, port, path structure) leaks. Additionally, query parameters from user requests (which may include PII: emails, names, search terms) are included in `target` via `request.nextUrl.search`.

**Fix:**
Log only the path and method, not the full internal URL. Strip or sanitize query params that may contain PII:

```typescript
logger.debug(
  {
    path: `/${path.join("/")}`,
    method,
    status: upstream.status,
    durationMs: Date.now() - startedAt,
  },
  "proxy"
)
```

---

### H-05 — No Security Headers (CSP, HSTS, X-Frame-Options, etc.)

**File:** `apps/web/next.config.ts`
**Severity:** High
**Risk:** Real — exposes users to clickjacking, MIME sniffing, XSS amplification

**Description:**
`next.config.ts` contains no `headers()` configuration. The following security headers are completely absent:

- `Content-Security-Policy` — no XSS protection
- `X-Frame-Options` or `frame-ancestors` — clickjacking possible
- `X-Content-Type-Options: nosniff` — MIME sniffing attacks possible
- `Referrer-Policy` — internal URLs may leak in Referer headers
- `Permissions-Policy` — no restriction on browser features (camera, microphone, etc.)
- `Strict-Transport-Security` (HSTS) — no HTTPS enforcement at app level

**Fix:**
Add security headers to `next.config.ts`:

```typescript
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // tighten after auditing inline scripts
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  // ...
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}
```

---

## Medium Issues

### M-01 — Session Data Rendered Raw in Dashboard (PII Exposure Risk)

**File:** `apps/web/app/[locale]/(app)/dashboard/page.tsx:29`
**Severity:** Medium
**Risk:** Real in production if dashboard is retained

**Description:**

```typescript
<pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
  {JSON.stringify(session, null, 2)}
</pre>
```

The full session object (including `session.id`, `expiresAt`, `user.id`, `user.email`, `user.image`) is rendered directly in the DOM. This is acceptable as boilerplate demo code but is dangerous if kept in production:

1. Session ID in the DOM — readable by any XSS payload.
2. PII (email, name, image URL) visible in browser DevTools to anyone with physical/remote access.
3. Browser extensions can read DOM content.

**Fix:** Remove the raw session dump before production. If needed for debugging, gate behind `NODE_ENV !== "production"`.

---

### M-02 — Proxy Forwards OPTIONS Preflights Without CORS Validation

**File:** `apps/web/app/api/[...path]/route.ts:95`
**Severity:** Medium
**Risk:** Theoretical — depends on backend CORS config

**Description:**
The proxy exports `proxy as OPTIONS`. When a browser sends a preflight `OPTIONS` request to `/api/*`, the proxy forwards it to the backend unchanged, including the original `Origin` header. The backend's CORS response headers (including `Access-Control-Allow-Origin`) are then passed back unchanged via `filterResponseHeaders`.

If the backend is misconfigured to return `Access-Control-Allow-Origin: *`, the proxy will faithfully forward that, making the Next.js app a CORS wildcard relay. This can allow cross-origin requests from any domain to access authenticated backend resources via the proxy.

**Fix:** In the OPTIONS handler, either:

1. Short-circuit and return CORS headers computed by Next.js itself (not forwarded from backend).
2. Explicitly strip `Access-Control-*` response headers from the proxied response and let Next.js/CDN manage CORS policy at the edge.

---

### M-03 — Axios `customAxiosInstance` on Server Side Loops Through Self

**File:** `packages/api-client/src/lib/axios-instance.ts:14-15`
**Severity:** Medium
**Risk:** Real — performance degradation, potential circular dependency in failure scenarios

**Description:**
On the server (RSC / route handlers), `baseURL` is set to `NEXT_PUBLIC_APP_URL` (e.g., `https://yourapp.com`). This means any server-side call using `customAxiosInstance` goes:

```
RSC → axios → https://yourapp.com/api/xxx → Next.js proxy → backend
```

Instead of:

```
RSC → backend directly (using BACKEND_URL)
```

This creates an unnecessary network hop through the Next.js process itself. Worse, if the Next.js server is under load, this self-request competes for the same thread pool. In failure scenarios, the server can deadlock calling itself.

The codebase already has `auth-server.ts` which uses `BACKEND_URL` directly. The `customAxiosInstance` should do the same on the server side.

**Fix:**

```typescript
const baseURL = isServer
  ? (process.env.BACKEND_URL ?? "http://localhost:4000")
  : ""
```

---

### M-04 — No Rate Limiting or Brute Force Protection on Login

**File:** `apps/web/app/[locale]/(auth)/login/page.tsx`, `apps/web/app/api/[...path]/route.ts`
**Severity:** Medium
**Risk:** Real — login endpoint fully exposed to automated attacks

**Description:**
There is no rate limiting at any layer:

1. The Next.js middleware applies no rate limiting.
2. The proxy route applies no rate limiting.
3. The login form has no CAPTCHA, no account lockout client-side signal.
4. Axios 401 interceptor redirects to login but doesn't block retry loops.

If the backend does not implement rate limiting on `/api/auth/sign-in/email`, this endpoint is open to brute force attacks. Even if the backend has rate limiting, the proxy doesn't propagate `Retry-After` headers to clients.

**Fix:**

- Add rate limiting at the Next.js middleware layer using e.g. `@upstash/ratelimit` with Redis.
- At minimum, ensure `Retry-After` response headers from backend are forwarded through the proxy (they are not in the hop-by-hop filter, so they should pass through — verify).
- Add exponential backoff on the client form for repeated failures.

---

### M-05 — `dangerouslySetInnerHTML` in chart.tsx with Unsanitized CSS Values

**File:** `packages/ui/src/components/chart.tsx:94-113`
**Severity:** Medium
**Risk:** Low-medium — depends on whether `config` values come from user input

**Description:**

```typescript
dangerouslySetInnerHTML={{
  __html: `--color-${key}: ${color};`
}}
```

The `color` value (from `ChartConfig`) is interpolated directly into a CSS `<style>` tag. If `color` is ever populated from user-controlled data (e.g., user theme preferences stored in DB), this allows CSS injection. While CSS injection is less severe than JS injection, it can be used for:

- Data exfiltration via CSS selectors + external resource loads.
- UI redressing attacks.

Currently `ChartConfig` is a developer-defined constant, so risk is low. But as a shared UI package this creates a footgun for any consumer.

**Fix:**
Sanitize color values to match only valid CSS color formats before injection:

```typescript
const SAFE_CSS_COLOR =
  /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\)|[a-zA-Z]+|var\(--[a-zA-Z0-9-]+\))$/
const safeColor = SAFE_CSS_COLOR.test(color) ? color : "transparent"
return safeColor ? `  --color-${key}: ${safeColor};` : null
```

---

## Low Issues

### L-01 — No `.env.example` at Root (only under apps/web)

**File:** Root directory
**Severity:** Low

The `.env.example` file exists only at `apps/web/.env.example`. There is no root-level template. New developers may not discover the example file and may skip env setup or accidentally configure `BACKEND_URL` pointing to a public/insecure service. The `.gitignore` correctly excludes `.env` files.

**Fix:** Add a root-level `.env.example` that references each app's template, or document the setup clearly in README.

---

### L-02 — Renovate Automerge Enabled for Minor/Patch on Non-Zero Semver Packages

**File:** `renovate.json:12-15`
**Severity:** Low

Renovate is configured to automerge minor and patch updates for all packages with `!/^0/` version. This includes security-sensitive packages like `better-auth`, `next`, `zod`. A supply chain attack via a malicious patch release would be automatically merged and deployed. This is a risk tradeoff, not a bug.

**Fix:** Consider disabling automerge for auth/security-sensitive packages and requiring manual review. At minimum, ensure CI runs full test suite before automerge completes.

---

### L-03 — ReactQueryDevtools Included in Bundle (Development Gate Relies on Runtime Check)

**File:** `apps/web/components/query-provider.tsx:13-16`
**Severity:** Low

`@tanstack/react-query-devtools` is imported and conditionally rendered via `process.env.NODE_ENV !== "development"`. Next.js tree-shakes this in production builds, so it is not a security risk in practice. However, this relies on build-time tree-shaking — if the import is ever changed or dynamic imports are used incorrectly, the devtools (which expose full query state including cached API responses) could leak to production.

**Fix:** Use `dynamic(() => import(...)`, `{ ssr: false }` import for devtools, which makes the intent explicit.

---

### L-04 — `server-only` Import Not Present in `query-client.ts`

**File:** `apps/web/lib/query-client.ts`
**Severity:** Low

`lib/logger.ts` and `lib/auth-server.ts` correctly import `"server-only"` to prevent accidental client-side bundling. However, `query-client.ts` which contains the singleton browser `QueryClient` does not guard against server-only import. While this specific file is safe to use on both sides, the pattern is inconsistent. More critically, `getQueryClient()` uses a module-level singleton (`browserQueryClient`) that persists across all users on the server if ever called in a server context — a potential data leak between requests.

**Fix:** The `isServer` check in `getQueryClient()` already creates a fresh instance per server invocation, which is correct. Add `// This file runs on both client and server by design` comment to make intent explicit.

---

## Checklist Summary

| Area                                  | Status       | Notes                                                             |
| ------------------------------------- | ------------ | ----------------------------------------------------------------- |
| Input validation at boundaries        | PARTIAL      | Zod schemas exist for auth forms; proxy validates nothing         |
| Auth: identity check                  | PARTIAL      | Middleware checks cookie presence only (not validity)             |
| Auth: permission check                | NOT IN SCOPE | Handled by backend; not verifiable in frontend review             |
| Security headers (CSP, HSTS, X-Frame) | MISSING      | No `headers()` in next.config.ts                                  |
| Open redirect protection              | MISSING      | `next` param not validated against origin                         |
| CSRF protection                       | DELEGATED    | better-auth handles CSRF; proxy passes tokens through             |
| Secrets in git                        | CLEAN        | .gitignore covers .env files; no hardcoded secrets found          |
| PII in logs                           | PARTIAL      | Cookie/auth headers redacted; query params with PII not redacted  |
| XSS (dangerouslySetInnerHTML)         | FOUND        | chart.tsx — CSS injection risk, low severity currently            |
| SSRF                                  | PARTIAL      | BACKEND_URL validated as URL format only; no IP range blocking    |
| Rate limiting                         | MISSING      | No layer in Next.js; delegated entirely to backend                |
| Dependency management                 | GOOD         | Renovate + pnpm overrides for known vulns; automerge risk noted   |
| Docker security                       | GOOD         | Non-root user, multi-stage build, minimal image                   |
| Server-only boundaries                | GOOD         | `server-only` imports used correctly in auth-server.ts, logger.ts |
| Env var validation                    | PARTIAL      | SKIP_ENV_VALIDATION=1 during build disables checks                |

---

## Top 5 Most Critical Gaps (Google-Scale Standard)

1. **C-01: Unauthenticated proxy to backend** — The single biggest gap. The entire backend API surface is publicly accessible via the Next.js proxy. This must be fixed before any production deployment.

2. **H-05: No security headers** — CSP, HSTS, X-Frame-Options are table stakes for any web app. Without CSP, XSS via any vector (third-party scripts, injected content) has no containment. A CDN/load balancer may add some headers, but relying on infrastructure rather than app-level headers is fragile.

3. **H-01: Open redirect** — Phishing attacks via crafted login URLs are trivially exploitable. One-line fix, high phishing impact.

4. **H-04: Internal URLs in logs** — When logs are shipped to external services, the internal network topology leaks. In cloud environments this includes internal service discovery addresses and can aid lateral movement after an initial compromise.

5. **H-03: SKIP_ENV_VALIDATION in Docker** — Silent misconfiguration failures are a leading cause of production incidents. An app that starts successfully with an invalid or missing `BACKEND_URL` will fail at runtime in subtle ways (requests silently failing, falling back to localhost, etc.).

---

## Positive Observations

- `server-only` import is used correctly in `auth-server.ts` and `logger.ts` — no server secrets can leak to client bundles.
- pino logger correctly redacts `cookie`, `authorization`, `password`, and `token` fields.
- Dockerfile uses multi-stage build, non-root user (`nextjs:nodejs`), and minimal standalone output.
- `@t3-oss/env-nextjs` with Zod validation is the correct pattern for env safety (when not skipped).
- `better-auth` session check at the layout level (`AppLayout`) provides a real server-side auth gate even when middleware is bypassed.
- Renovate is configured with `vulnerabilityAlerts: enabled` — known CVEs in dependencies will be flagged.
- pnpm `overrides` in `package.json` proactively pins known-vulnerable transitive dependency versions.
- `redirect: "manual"` in the proxy correctly prevents SSRF via 3xx chain following to internal resources.
- No hardcoded secrets found anywhere in the codebase.
- `.gitignore` correctly excludes all `.env*` files and `.pem` keys.
