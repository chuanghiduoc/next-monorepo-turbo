import { createAuthClient } from "better-auth/react"

/**
 * Better Auth client talks to `/api/auth/*` on the current origin.
 * The Next.js proxy at `app/api/[...path]/route.ts` forwards to the backend.
 * Cookies are therefore set on the FE domain (same-origin), no CORS needed.
 *
 * Resolved at runtime against `window.location.origin` so the same image works
 * on any host/port. The SSR fallback is only used during build prerendering
 * — it is never actually called (auth client runs in the browser).
 */
const baseURL =
  typeof window === "undefined"
    ? "http://localhost/api/auth"
    : `${window.location.origin}/api/auth`

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
})

export const { useSession, signIn, signOut, signUp, getSession } = authClient
