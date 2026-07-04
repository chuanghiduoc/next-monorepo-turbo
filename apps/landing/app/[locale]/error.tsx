"use client"

import { useEffect } from "react"
import { Button } from "@workspace/ui/components/button"

/** Segment error boundary. Catches render/data errors below the locale layout. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface to your monitoring here; digest correlates with server logs.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Error
      </p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Try again — if it keeps happening, contact
        support.
      </p>
      {error.digest ? (
        <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
          {error.digest}
        </code>
      ) : null}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
