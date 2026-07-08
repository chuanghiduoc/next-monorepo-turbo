"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import type { ReactNode } from "react"

import { getQueryClient } from "@/lib/query-client"

// Dynamic + ssr:false: devtools load as a separate client-only chunk, only when
// rendered — never shipped to production regardless of tree-shaking.
const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
  { ssr: false }
)

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
