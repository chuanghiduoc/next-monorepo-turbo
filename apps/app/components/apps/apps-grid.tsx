import { Eye, MoreHorizontal, Settings, Trash2 } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

type Env = "Production" | "Staging" | "Development"

type AppItem = {
  name: string
  tech: string
  env: Env
  color: string
  requests: string
  uptime: string
}

const ENV_VARIANT: Record<Env, "success" | "warning" | "brand"> = {
  Production: "success",
  Staging: "warning",
  Development: "brand",
}

const APPS: AppItem[] = [
  {
    name: "Marketing Landing Page",
    tech: "Next.js",
    env: "Production",
    color: "var(--chart-1)",
    requests: "128K",
    uptime: "99.98%",
  },
  {
    name: "Customer Portal",
    tech: "React",
    env: "Production",
    color: "var(--chart-2)",
    requests: "96K",
    uptime: "99.95%",
  },
  {
    name: "Internal Dashboard",
    tech: "Next.js",
    env: "Staging",
    color: "var(--chart-3)",
    requests: "12K",
    uptime: "99.80%",
  },
  {
    name: "AI Image Generator",
    tech: "Python",
    env: "Development",
    color: "var(--chart-4)",
    requests: "4.2K",
    uptime: "98.60%",
  },
  {
    name: "Data Processing API",
    tech: "Go",
    env: "Production",
    color: "var(--chart-5)",
    requests: "64K",
    uptime: "99.99%",
  },
  {
    name: "Auth Service",
    tech: "Go",
    env: "Production",
    color: "var(--chart-1)",
    requests: "212K",
    uptime: "99.99%",
  },
  {
    name: "Webhooks Worker",
    tech: "Python",
    env: "Staging",
    color: "var(--chart-2)",
    requests: "18K",
    uptime: "99.40%",
  },
  {
    name: "Billing Sync",
    tech: "Next.js",
    env: "Production",
    color: "var(--chart-3)",
    requests: "8.6K",
    uptime: "99.92%",
  },
  {
    name: "Search Indexer",
    tech: "Go",
    env: "Development",
    color: "var(--chart-4)",
    requests: "3.1K",
    uptime: "97.85%",
  },
]

function AppCard({ app }: { app: AppItem }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold text-white"
            style={{ backgroundColor: app.color }}
          >
            {app.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{app.name}</p>
            <p className="truncate text-xs text-muted-foreground">{app.tech}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-label={`Actions for ${app.name}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <Badge variant={ENV_VARIANT[app.env]}>{app.env}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Requests</p>
          <p className="text-sm font-semibold tabular-nums">{app.requests}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Uptime</p>
          <p className="text-sm font-semibold tabular-nums">{app.uptime}</p>
        </div>
      </div>
    </div>
  )
}

export function AppsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {APPS.map((app) => (
        <AppCard key={app.name} app={app} />
      ))}
    </div>
  )
}
