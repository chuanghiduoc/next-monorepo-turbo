"use client"

import {
  ArrowRight,
  Check,
  Moon,
  Search,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

/** Section wrapper with a mono eyebrow + title. */
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-xs tracking-[0.16em] text-brand uppercase">
          {eyebrow}
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function Swatch({
  name,
  className,
  ring,
}: {
  name: string
  className: string
  ring?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "h-16 rounded-lg",
          ring ? "ring-1 ring-border ring-inset" : "",
          className
        )}
      />
      <p className="font-mono text-[11px] text-muted-foreground">{name}</p>
    </div>
  )
}

const NAV = [
  ["colors", "Colors"],
  ["type", "Type"],
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["forms", "Forms"],
  ["cards", "Cards"],
  ["feedback", "Feedback"],
  ["data", "Data"],
] as const

export default function PreviewPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
              {"{}"}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">turbo/ui</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                design system
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Moon className="size-[1.15rem] dark:hidden" />
            <Sun className="hidden size-[1.15rem] dark:block" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-5 py-12 sm:px-8 sm:py-16">
        {/* Intro */}
        <div className="space-y-3">
          <Badge variant="brand" className="font-mono">
            <Zap className="size-3" /> enterprise blue · amber accent
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A modern, data-dense UI kit.
          </h1>
          <p className="max-w-2xl text-lg text-balance text-muted-foreground">
            Custom-tuned shadcn components in{" "}
            <code className="font-mono text-sm">packages/ui</code> — one source
            of truth shared by every app. Toggle the theme to check both modes.
          </p>
        </div>

        {/* Colors */}
        <Section id="colors" eyebrow="Foundations" title="Color tokens">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Swatch name="primary" className="bg-primary" />
            <Swatch name="brand" className="bg-brand" />
            <Swatch name="highlight" className="bg-highlight" />
            <Swatch name="success" className="bg-success" />
            <Swatch name="warning" className="bg-warning" />
            <Swatch name="destructive" className="bg-destructive" />
            <Swatch name="background" className="bg-background" ring />
            <Swatch name="card" className="bg-card" ring />
            <Swatch name="muted" className="bg-muted" ring />
            <Swatch name="accent" className="bg-accent" ring />
            <Swatch name="border" className="bg-border" ring />
            <Swatch name="foreground" className="bg-foreground" />
          </div>
        </Section>

        {/* Typography */}
        <Section id="type" eyebrow="Foundations" title="Typography">
          <Card>
            <CardContent className="space-y-4 py-6">
              <p className="font-display text-4xl font-semibold tracking-tight">
                Display · Bricolage Grotesque
              </p>
              <p className="font-heading text-2xl font-semibold">
                Heading · display grotesk 24px
              </p>
              <p className="text-base">
                Body · Geist Sans 16px — the quick brown fox jumps over the lazy
                dog. Readable, neutral, modern.
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                Mono · Geist Mono — 0123456789 · const app = &quot;turbo&quot;
              </p>
            </CardContent>
          </Card>
        </Section>

        {/* Buttons */}
        <Section id="buttons" eyebrow="Components" title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="highlight">
              <Zap className="size-4" /> Highlight
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1400)
              }}
              disabled={loading}
            >
              {loading ? "Saving…" : "Click to load"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section id="badges" eyebrow="Components" title="Badges & status">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge>Default</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="highlight">
              <TrendingUp className="size-3" /> +12.5%
            </Badge>
            <Badge variant="success">
              <Check className="size-3" /> Active
            </Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="destructive">Suspended</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        {/* Forms */}
        <Section id="forms" eyebrow="Components" title="Form controls">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Labels, states and search.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input
                    id="p-email"
                    type="email"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-err">Invalid field</Label>
                  <Input id="p-err" aria-invalid defaultValue="not-an-email" />
                  <p className="text-xs text-destructive">
                    Enter a valid email.
                  </p>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search…" className="pl-9" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toggles</CardTitle>
                <CardDescription>Switch and checkbox.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="p-sw">Enable notifications</Label>
                  <Switch id="p-sw" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center gap-2.5">
                  <Checkbox id="p-cb" defaultChecked />
                  <Label htmlFor="p-cb">I agree to the terms</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <Checkbox id="p-cb2" />
                  <Label htmlFor="p-cb2">Subscribe to updates</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Cards */}
        <Section id="cards" eyebrow="Patterns" title="Cards & metrics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "API requests", value: "128.4k", delta: "+12.5%" },
              { label: "Active users", value: "2,318", delta: "+4.2%" },
              { label: "Avg. latency", value: "84ms", delta: "-6.1%" },
              { label: "Uptime", value: "99.98%", delta: "+0.01%" },
            ].map((s) => (
              <Card
                key={s.label}
                className="relative gap-0 overflow-hidden py-0 transition-colors hover:border-brand/40"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-brand/60"
                />
                <CardHeader className="gap-1 pt-5">
                  <CardDescription className="font-mono text-[11px] tracking-[0.14em] uppercase">
                    {s.label}
                  </CardDescription>
                  <CardTitle className="font-display text-[2rem] leading-none font-semibold tabular-nums">
                    {s.value}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="highlight" className="font-mono">
                      {s.delta}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="border-t border-border/60 py-3 text-xs text-muted-foreground">
                  vs. last week
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>

        {/* Feedback */}
        <Section id="feedback" eyebrow="Components" title="Alerts">
          <div className="grid gap-4 lg:grid-cols-2">
            <Alert>
              <Check className="size-4" />
              <AlertTitle>Deployed successfully</AlertTitle>
              <AlertDescription>
                app · production is live on the latest release.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Zap className="size-4" />
              <AlertTitle>Build failed</AlertTitle>
              <AlertDescription>
                Type error in dashboard/page.tsx — check the logs.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* Data table */}
        <Section id="data" eyebrow="Patterns" title="Data table">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    n: "Ada Lovelace",
                    r: "Admin",
                    s: "success",
                    st: "Active",
                    m: "$290",
                  },
                  {
                    n: "Alan Turing",
                    r: "Member",
                    s: "warning",
                    st: "Invited",
                    m: "$0",
                  },
                  {
                    n: "Grace Hopper",
                    r: "Member",
                    s: "success",
                    st: "Active",
                    m: "$90",
                  },
                  {
                    n: "Dennis Ritchie",
                    r: "Viewer",
                    s: "destructive",
                    st: "Suspended",
                    m: "$0",
                  },
                ].map((row) => (
                  <TableRow key={row.n}>
                    <TableCell className="pl-5 font-medium">{row.n}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.r}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.s as "success" | "warning" | "destructive"}
                      >
                        {row.st}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right font-mono tabular-nums">
                      {row.m}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>
      </main>
    </div>
  )
}
