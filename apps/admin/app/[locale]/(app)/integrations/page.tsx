import {
  Activity,
  BarChart3,
  CreditCard,
  FileText,
  GitBranch,
  Layers,
  MessageSquare,
  Palette,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await (
    await import("next-intl/server")
  ).getTranslations({ locale, namespace: "nav" })
  return { title: t("integrations") }
}

type Category = "Communication" | "Dev" | "Analytics"

type Integration = {
  name: string
  description: string
  category: Category
  icon: LucideIcon
  connected: boolean
}

const CATEGORIES = ["All", "Communication", "Dev", "Analytics"] as const

const INTEGRATIONS: Integration[] = [
  {
    name: "Slack",
    description: "Get alerts and updates delivered to your channels.",
    category: "Communication",
    icon: MessageSquare,
    connected: true,
  },
  {
    name: "GitHub",
    description: "Sync issues, pull requests, and deployments.",
    category: "Dev",
    icon: GitBranch,
    connected: true,
  },
  {
    name: "Stripe",
    description: "Sync invoices, payments, and subscription events.",
    category: "Dev",
    icon: CreditCard,
    connected: true,
  },
  {
    name: "Linear",
    description: "Link tasks and track engineering progress.",
    category: "Dev",
    icon: Layers,
    connected: false,
  },
  {
    name: "Figma",
    description: "Attach design files directly to projects.",
    category: "Dev",
    icon: Palette,
    connected: false,
  },
  {
    name: "Notion",
    description: "Share docs and specs with your workspace.",
    category: "Communication",
    icon: FileText,
    connected: false,
  },
  {
    name: "Google Analytics",
    description: "Track traffic and conversions in one dashboard.",
    category: "Analytics",
    icon: BarChart3,
    connected: false,
  },
  {
    name: "Zapier",
    description: "Automate workflows across thousands of apps.",
    category: "Dev",
    icon: Zap,
    connected: false,
  },
  {
    name: "Datadog",
    description: "Monitor uptime, latency, and error rates.",
    category: "Analytics",
    icon: Activity,
    connected: false,
  },
]

export default function IntegrationsPage() {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect OrbitOps with the tools your team already uses.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search integrations…" className="pl-8" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "brand" : "outline"}
              className="cursor-pointer px-3 py-1"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.name}
              className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-5" />
                </span>
                <Badge
                  variant={integration.connected ? "success" : "secondary"}
                >
                  {integration.connected ? "Connected" : "Not connected"}
                </Badge>
              </div>

              <h3 className="mt-3 text-sm font-semibold">{integration.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {integration.description}
              </p>

              <Button
                variant={integration.connected ? "outline" : "default"}
                size="sm"
                className="mt-4 w-full"
              >
                {integration.connected ? "Manage" : "Connect"}
              </Button>
            </div>
          )
        })}
      </div>
    </>
  )
}
