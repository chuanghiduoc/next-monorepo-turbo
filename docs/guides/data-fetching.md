# Data Fetching — TanStack Query + `api-client`

How data moves from the backend into a component in this repo. Everything the
browser fetches goes through the same-origin `/api/*` proxy; everything is cached
by **TanStack Query**; typed access lives in **`@workspace/api-client`**.

> Prerequisite: read [system-architecture.md §5 (Data flow)](../system-architecture.md).
> The proxy at `apps/<app>/app/api/[...path]/route.ts` forwards `/api/*` to
> `BACKEND_URL`. This guide is about the client side of that boundary.

---

## 1. The mental model

```
Component  ──useQuery/useMutation──▶  hook in @workspace/api-client
                                            │ apiClient (axios, baseURL="")
                                            ▼
                                      GET /api/v1/health           (same-origin)
                                            │  Next proxy route
                                            ▼
                                      BACKEND_URL/api/v1/health    (server-only)
```

Three rules fall out of this:

1. **Every request path starts with `/api/...`** so the proxy matches it.
2. **The browser axios `baseURL` is `""`** — requests stay same-origin, cookies
   ride along, no CORS.
3. **Reusable hooks live in `packages/api-client`**, not in app code, so all
   three apps share one typed surface.

---

## 2. Where the pieces live

| Piece               | File                                            | Responsibility                                    |
| ------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Axios instance      | `packages/api-client/src/lib/axios-instance.ts` | base URL, credentials, 401 redirect, cancel token |
| Query hooks         | `packages/api-client/src/hooks/*.ts`            | one file per resource (`use-health.ts`)           |
| Public exports      | `packages/api-client/src/index.ts`              | re-export hooks + `apiClient` + `ApiError`        |
| QueryClient factory | `apps/<app>/lib/query-client.ts`                | defaults: staleTime, retry policy, dehydrate      |
| Provider            | `apps/<app>/components/query-provider.tsx`      | wraps the tree, mounts devtools in dev            |

---

## 3. The axios instance (read this once)

`packages/api-client/src/lib/axios-instance.ts`:

```ts
const isServer = typeof window === "undefined"
const baseURL = isServer
  ? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  : ""

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // send the session cookie
  timeout: 30_000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
})

// Global 401 handler — bounce to /login with a safe ?next
apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // ...window.location.replace(`/login?next=...`)
    }
    return Promise.reject(error)
  }
)
```

Key points:

- **On the server** the base URL is absolute (`NEXT_PUBLIC_APP_URL`) so axios can
  resolve it; **in the browser** it's `""` (relative → same-origin proxy).
- A `401` anywhere triggers a single redirect to `/login`. You don't handle
  auth-expiry per call.
- `customAxiosInstance` (also exported) adds a cancel token per request — it's the
  mutator function an **Orval** codegen setup would call. Use it if/when you wire
  Orval; hand-written hooks can use `apiClient` directly.

---

## 4. Writing a query hook

The canonical example, `packages/api-client/src/hooks/use-health.ts`:

```ts
export interface HealthStatus {
  status: "ok" | "degraded" | "down"
  uptime: number
  timestamp: string
}

const fetchHealth = async (): Promise<HealthStatus> => {
  const { data } = await apiClient.get<HealthStatus>("/api/v1/health")
  return data
}

export const healthQueryKey = ["health"] as const

export const useHealth = (
  options?: Omit<
    UseQueryOptions<HealthStatus, ApiError>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: healthQueryKey,
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    ...options,
  })
```

The four conventions to copy:

1. **Export the response type** (`HealthStatus`) — callers type their `data`.
2. **Export the key** (`healthQueryKey`) as `as const` — callers invalidate with
   the exact same reference.
3. **Accept `options?`** with `queryKey`/`queryFn` omitted — callers can pass
   `enabled`, `select`, `staleTime`, etc. without you re-declaring them.
4. **Type errors as `ApiError`** (an `AxiosError`) — `error.response?.status` is
   then typed.

Register the new hook in `packages/api-client/src/index.ts`:

```ts
export * from "./hooks/use-health.js"
export * from "./hooks/use-projects.js" // ← add yours
```

> Note the `.js` extension in imports/exports — this package ships as ESM and TS
> requires the runtime extension. Keep it.

---

## 5. Query keys — the convention

Use a **tuple, broad → narrow**, so partial invalidation works:

```ts
// list                    → ["projects"]
// list with filters       → ["projects", { status: "active", page: 2 }]
// single entity           → ["projects", projectId]
```

Then a mutation can invalidate the whole family:

```ts
queryClient.invalidateQueries({ queryKey: ["projects"] }) // list + all detail
```

Export a small key factory when a resource grows past one key:

```ts
export const projectKeys = {
  all: ["projects"] as const,
  list: (filters: ProjectFilters) => ["projects", filters] as const,
  detail: (id: string) => ["projects", id] as const,
}
```

---

## 6. The QueryClient — defaults you inherit

`apps/<app>/lib/query-client.ts` sets project-wide behavior. You rarely override
it per query:

```ts
const STALE_TIME_MS = 60_000

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS, // 60s: data is "fresh", no refetch
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = (error as { response?: { status?: number } })?.response
            ?.status
          if (status && status >= 400 && status < 500) return false // don't retry 4xx
          return failureCount < 2 // retry 5xx twice
        },
      },
      mutations: { retry: false },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  })
}
```

What this buys you:

- **4xx are never retried** (a `404`/`401`/`422` is a real answer, not a blip);
  **5xx retry twice** then surface.
- **`staleTime: 60s`** means navigating back to a page within a minute shows
  cached data instantly.
- **`shouldDehydrateQuery` includes `pending`** — this is what lets you _prefetch
  on the server_ and stream the in-flight query to the client (see §8).

The factory pattern (`getQueryClient`) returns a **new client per request on the
server** and a **singleton in the browser** — never share a server client across
requests.

---

## 7. Mutations — the standard shape

There is no mutation hook in the boilerplate yet; here is the pattern to add.
Put it in `api-client` next to the queries:

```ts
// packages/api-client/src/hooks/use-create-project.ts
export interface CreateProjectInput {
  name: string
}
export interface Project {
  id: string
  name: string
}

export const useCreateProject = (
  options?: UseMutationOptions<Project, ApiError, CreateProjectInput>
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input) => {
      const { data } = await apiClient.post<Project>("/api/v1/projects", input)
      return data
    },
    onSuccess: (project, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      options?.onSuccess?.(project, vars, ctx)
    },
    ...options,
  })
}
```

In the component (`"use client"`):

```tsx
const { mutate, isPending } = useCreateProject({
  onSuccess: () => toast.success(t("projects.created")),
  onError: (e) => toast.error(e.response?.data?.message ?? t("common.error")),
})

<Button disabled={isPending} onClick={() => mutate({ name })}>
  {isPending ? t("common.saving") : t("common.save")}
</Button>
```

Notes:

- Mutations **don't retry** (from the client defaults) — a double-charge is worse
  than a failure. Keep it that way for non-idempotent writes.
- Invalidate the affected **query family** in `onSuccess`, then let TanStack
  refetch. Reach for `setQueryData` (optimistic update) only when the UX needs it.

---

## 8. Server rendering — prefetch + hydrate

Because `dehydrate` includes pending queries, you can start a fetch in a Server
Component and let the client take it over without a second round-trip:

```tsx
// app/[locale]/(app)/health/page.tsx  — Server Component
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { healthQueryKey } from "@workspace/api-client"

export default async function HealthPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: healthQueryKey,
    queryFn: () =>
      fetch(`${process.env.BACKEND_URL}/api/v1/health`).then((r) => r.json()),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HealthWidget />{" "}
      {/* "use client", calls useHealth() — no refetch flash */}
    </HydrationBoundary>
  )
}
```

On the server you call the backend **directly** (`BACKEND_URL`) — you're already
past the proxy boundary. In the client component `useHealth()` reads from the
hydrated cache.

---

## 9. The provider

`apps/<app>/components/query-provider.tsx` (mounted in the locale layout):

```tsx
"use client"
export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      ) : null}
    </QueryClientProvider>
  )
}
```

Devtools ship **only in development** (guarded by `NODE_ENV`), so they never
reach the production bundle.

---

## 10. Worked example — a paginated list resource

**Goal:** `/projects` page listing projects with a create button.

**Step 1 — hook (`packages/api-client/src/hooks/use-projects.ts`):**

```ts
export interface Project {
  id: string
  name: string
  status: "active" | "archived"
}
export interface ProjectPage {
  items: Project[]
  total: number
}

export const projectKeys = {
  all: ["projects"] as const,
  list: (page: number) => ["projects", { page }] as const,
}

export const useProjects = (page: number) =>
  useQuery({
    queryKey: projectKeys.list(page),
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectPage>("/api/v1/projects", {
        params: { page },
      })
      return data
    },
    placeholderData: (prev) => prev, // keep old page visible while next loads
  })
```

**Step 2 — export it** in `index.ts`.

**Step 3 — the page** (server shell + client list):

```tsx
// app/[locale]/(app)/projects/page.tsx  (Server Component)
export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" />
      <ProjectList /> {/* client component below */}
    </>
  )
}
```

```tsx
// components/projects/project-list.tsx  ("use client")
export function ProjectList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useProjects(page)

  if (isLoading) return <ProjectListSkeleton />
  if (isError) return <ErrorState message={error.response?.data?.message} />
  if (!data.items.length) return <EmptyState />

  return (
    <>
      {data.items.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
      <Pagination page={page} total={data.total} onChange={setPage} />
    </>
  )
}
```

Every async surface covers **loading / error / empty** — that's a
[code-standards](../code-standards.md) requirement, not optional.

---

## 11. Do / Don't

**Do**

- Put reusable hooks in `api-client`; keep app code calling `useThing()`.
- Prefix every path with `/api/` so the proxy matches.
- Type the response and export both the type and the key.
- Handle loading, error, and empty in every consumer.
- Let 4xx surface; retries are for 5xx only (already configured).

**Don't**

- Don't `fetch(BACKEND_URL)` from a client component — it leaks the backend and
  breaks CORS. Go through `/api/*`.
- Don't create a `QueryClient` inside a component render — use `getQueryClient()`.
- Don't invalidate with a freshly-typed array literal that doesn't match the
  hook's key; import and reuse the exported key.
- Don't retry mutations on non-idempotent writes.
- Don't import `logger` or any `server-only` module into a query hook that runs
  in the browser.

---

## Related

- [auth.md](./auth.md) — the cookie that `withCredentials` sends, and the 401 flow.
- [env-and-config.md](./env-and-config.md) — `BACKEND_URL` / `NEXT_PUBLIC_APP_URL`.
- [testing.md](./testing.md) — mocking `/api/*` with MSW in unit tests.
