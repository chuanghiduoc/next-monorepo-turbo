import { Button } from "@workspace/ui/components/button"

import { Link } from "@/i18n/navigation"

/** Localized 404 rendered inside the locale layout. */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-heading text-6xl font-semibold tracking-tight text-brand">
        404
      </p>
      <h1 className="text-lg font-medium">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
