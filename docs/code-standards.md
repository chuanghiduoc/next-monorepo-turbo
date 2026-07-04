# Code Standards

Conventions for writing code in this monorepo. Architecture and "where things
live" is in [`system-architecture.md`](./system-architecture.md); this file is
the day-to-day coding rulebook.

## Naming

- **Files:** kebab-case for `.ts`/`.tsx` (`stat-card.tsx`, `use-mobile.ts`).
- **Components:** `PascalCase`. **Hooks:** `useThing`. **Vars/functions:** `camelCase`.
- **Folders:** kebab-case; group feature components under `components/<feature>/`.
- No plan IDs / phase numbers / audit labels in code, tests, or commit messages —
  describe the behavior instead.

## TypeScript

- Strict everywhere. Respect `noUncheckedIndexedAccess` — index access is
  `T | undefined`; guard or assert deliberately.
- Prefer explicit prop types; avoid `any` (justify with a comment if unavoidable).
- Share DTOs/types where reuse is real; don't over-abstract prematurely (YAGNI).

## React / Next.js

- Server Components by default; `"use client"` only when needed (see architecture §4).
- Never pass functions/components across the RSC→client boundary — wrap data in a
  client component.
- Data mutations and secrets stay server-side; the client hits `/api/*` only.
- Every async surface has a loading (`loading.tsx`/Suspense) and error
  (`error.tsx`) state.

## Styling

- Tailwind v4 utilities driven by **semantic tokens** (`bg-brand`, `text-success`,
  `border-border`, …). **No raw hex** in components.
- Cards: `rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]`.
- Numbers `tabular-nums`; headings `font-heading`; mono labels `font-mono`.
- Respect `prefers-reduced-motion`; transitions 150–300ms; animate transform/opacity.
- Design light + dark together; verify contrast (≥4.5:1 body text).

## Accessibility

- Icon-only buttons need `aria-label`; inputs need a `<Label htmlFor>`.
- Visible focus rings (`focus-visible:ring-*`) — never remove them.
- Touch targets ≥ 40px; don't convey meaning by color alone (pair with icon/text).

## Data & determinism

- Sample/demo data is deterministic (`Math.sin` over index). No `Math.random()` or
  `new Date()` at module scope — it breaks SSR hydration and build caching.
- Validate external input at the boundary with Zod.

## Files & cleanliness

- No dead code, unused imports, or debug logs. Run `pnpm knip` to catch orphans.
- One responsibility per file; split only when it reduces real complexity.
- Descriptive comments explain **why**, not what.

## Git & commits

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`…), enforced by
  commitlint. Keep commits focused; no AI references in messages.
- Never commit secrets, `.env*`, tokens, keys, or credentials.
- Add a Changeset for user-facing package changes (`pnpm changeset`).

## Before you push

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

All four must be green. Fix regressions rather than weakening tests.
