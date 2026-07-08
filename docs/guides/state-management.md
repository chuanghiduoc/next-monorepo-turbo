# State Management — Zustand (local UI state only)

Zustand holds **local UI state** — things the client owns that never live on the
server: sidebar collapsed, a modal's open flag, an unsaved wizard step, theme
preference. **Server data does not go here** — that's TanStack Query's job. Keep
the two separate and most "state management" problems disappear.

> Canonical file: `apps/<app>/lib/stores/ui-store.ts`. It's the only store in the
> boilerplate; add new ones beside it.

---

## 1. The decision — where does this state belong?

| The value is…                                             | Use                                                          | Why                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Fetched from the backend                                  | **TanStack Query** ([data-fetching.md](./data-fetching.md))  | it has an owner (the server), caching, refetch, invalidation |
| The logged-in user                                        | **`useSession` / `getServerSession`** ([auth.md](./auth.md)) | auth owns it                                                 |
| Local to one component                                    | **`useState`**                                               | no need for a store                                          |
| Local, shared across many components, survives navigation | **Zustand**                                                  | one source, no prop-drilling                                 |
| Derivable from other state or props                       | **compute it**                                               | don't store what you can calculate                           |

**Rule of thumb:** if a refetch or a page reload from the backend could produce
the value, it's server state → Query, not Zustand. Zustand is for _client-only_
state that has no backend representation.

---

## 2. The canonical store

`apps/<app>/lib/stores/ui-store.ts`:

```ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface UIState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "ui-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // ← the SSR-safety switch, see §4
    }
  )
)
```

Four conventions to copy:

1. **`create<UIState>()(...)`** — the double call with an explicit type param is
   the Zustand v5 signature that keeps the state fully typed.
2. **State + actions in one interface.** Actions live in the store, not in
   components — components call `toggleSidebar()`, they don't `set()` directly.
3. **Immutable updates** — `set((state) => ({ ... }))` returns a new partial;
   never mutate `state` in place.
4. **`persist` + `skipHydration`** when the value must survive reloads — but read
   §4 first, it's the part that bites people.

---

## 3. Reading with selectors (avoid needless re-renders)

Subscribe to the **narrowest slice** you need. A selector re-renders the
component only when _that slice_ changes:

```tsx
"use client"
// ✅ re-renders only when sidebarCollapsed flips
const collapsed = useUIStore((s) => s.sidebarCollapsed)
const toggle = useUIStore((s) => s.toggleSidebar)

// ❌ subscribes to the whole store — re-renders on any field change
const store = useUIStore()
```

Selecting an **action** (`toggleSidebar`) is stable — actions never change
identity, so that subscription never causes a re-render. If you need several
fields at once, either take several selectors or use `useShallow`:

```tsx
import { useShallow } from "zustand/react/shallow"
const { collapsed, toggle } = useUIStore(
  useShallow((s) => ({
    collapsed: s.sidebarCollapsed,
    toggle: s.toggleSidebar,
  }))
)
```

---

## 4. `persist` + SSR — why `skipHydration` matters

`persist` writes state to `localStorage`. But **`localStorage` doesn't exist on
the server**, so the server renders with the store's _initial_ value while the
browser would immediately rehydrate to the _persisted_ value → a hydration
mismatch and a flash.

`skipHydration: true` stops the store from auto-rehydrating on import. You then
rehydrate **manually, in an effect, after mount** — so the server and the first
client render agree, then the persisted value comes in on the client only:

```tsx
"use client"
import { useEffect } from "react"
import { useUIStore } from "@/lib/stores/ui-store"

/** Mount once, high in the client tree (e.g. inside the app shell). */
export function StoreHydration() {
  useEffect(() => {
    void useUIStore.persist.rehydrate()
  }, [])
  return null
}
```

Until rehydration runs, the store returns the initial value (`sidebarCollapsed:
false`) on both server and client — no mismatch. This is the same principle as
the [code-standards](../code-standards.md) "no `Math.random()`/`Date` at module
scope" rule: **the first client render must match the server render.**

> If a store holds only session-scoped state you don't need to persist, drop
> `persist` entirely and this whole concern goes away. Only persist what genuinely
> must survive a reload.

---

## 5. Using state outside React

Zustand stores are callable outside components — handy in event handlers,
utilities, or one-off reads without subscribing:

```ts
// read once, no subscription
const collapsed = useUIStore.getState().sidebarCollapsed

// write from anywhere
useUIStore.getState().setSidebarCollapsed(true)

// subscribe imperatively (remember to unsubscribe)
const unsub = useUIStore.subscribe((s) => console.log(s.sidebarCollapsed))
// ...later
unsub()
```

Always call the returned `unsub` on cleanup — a leaked subscription is a leaked
listener ([code-standards](../code-standards.md): clean up every resource).

---

## 6. Worked example — a command-palette open store

**Goal:** a ⌘K command palette any component can open, closed on route change,
not persisted (session-scoped).

```ts
// lib/stores/command-store.ts
import { create } from "zustand"

interface CommandState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useCommandStore = create<CommandState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
```

No `persist` here — an open palette shouldn't survive a reload. Wire a global
shortcut and the dialog:

```tsx
"use client"
export function CommandPalette() {
  const open = useCommandStore((s) => s.open)
  const setOpen = useCommandStore((s) => s.setOpen)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useCommandStore.getState().toggle() // read fresh, no subscription needed here
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey) // cleanup
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      {/* … */}
    </CommandDialog>
  )
}
```

The header's search button just calls `useCommandStore.getState().setOpen(true)`
— no prop drilling, no context provider.

---

## 7. Do / Don't

**Do**

- Keep server data in TanStack Query; keep Zustand for client-only UI state.
- Put actions in the store; keep components calling named actions.
- Select the narrowest slice; select actions for stable references.
- Use `skipHydration` + manual `rehydrate()` whenever you `persist`.
- Only `persist` what must survive a reload.

**Don't**

- Don't cache API responses in a Zustand store — you'll reinvent Query badly
  (no refetch, no invalidation, stale forever).
- Don't `persist` without `skipHydration` in an SSR app — hydration mismatch.
- Don't mutate `state` in place inside `set` — return a new object.
- Don't subscribe to the whole store when you need one field.
- Don't reach for a store when `useState` in one component suffices.

---

## Related

- [data-fetching.md](./data-fetching.md) — server state (the thing that is _not_ Zustand).
- [auth.md](./auth.md) — session state, also not Zustand.
- [app shell (system-architecture.md §7)](../system-architecture.md) — where `sidebarCollapsed` is consumed.
