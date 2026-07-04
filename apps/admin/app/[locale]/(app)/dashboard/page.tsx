import { getTranslations } from "next-intl/server"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import {
  PerformanceTrends,
  RevenueBySource,
} from "@/components/overview-charts"
import { OverviewStats } from "@/components/overview-stats"

const TX = [
  {
    id: "INV-5689",
    c: "Acme Corporation",
    plan: "Pro Plan",
    amt: "$2,499.00",
    date: "Jun 10, 2025",
    paid: true,
  },
  {
    id: "INV-5688",
    c: "Stellar Labs",
    plan: "Team Plan",
    amt: "$1,199.00",
    date: "Jun 10, 2025",
    paid: true,
  },
  {
    id: "INV-5687",
    c: "Blue Horizon Co.",
    plan: "Pro Plan",
    amt: "$2,499.00",
    date: "Jun 9, 2025",
    paid: true,
  },
  {
    id: "INV-5686",
    c: "Nova Systems",
    plan: "Basic Plan",
    amt: "$499.00",
    date: "Jun 9, 2025",
    paid: false,
  },
  {
    id: "INV-5685",
    c: "Pioneer LLC",
    plan: "Team Plan",
    amt: "$1,199.00",
    date: "Jun 8, 2025",
    paid: true,
  },
]

const ACTIVITY = [
  {
    who: "Olivia Bennett",
    what: "created a new project",
    tgt: "“Website Redesign”",
    ago: "2h ago",
  },
  {
    who: "Liam Carter",
    what: "updated project",
    tgt: "“Mobile App”",
    ago: "4h ago",
  },
  {
    who: "Ava Patel",
    what: "invited 2 new users to the team",
    tgt: "",
    ago: "6h ago",
  },
  { who: "Noah Williams", what: "commented on a task", tgt: "", ago: "1d ago" },
  {
    who: "Emma Johnson",
    what: "completed setup steps",
    tgt: "",
    ago: "2d ago",
  },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return { title: t("overview") }
}

export default async function OverviewPage() {
  const t = await getTranslations("overview")

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <OverviewStats />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PerformanceTrends />
        </div>
        <div className="lg:col-span-2">
          <RevenueBySource />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent transactions */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs shadow-black/[0.03] lg:col-span-3">
          <div className="flex items-center justify-between p-5">
            <h3 className="text-sm font-semibold">{t("transactions")}</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">{t("cols.id")}</TableHead>
                  <TableHead>{t("cols.customer")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("cols.plan")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("cols.amount")}
                  </TableHead>
                  <TableHead className="pr-5 text-right">
                    {t("cols.status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TX.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-[10px] font-semibold uppercase">
                          {row.c.slice(0, 2)}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {row.c}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {row.plan}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {row.amt}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Badge variant={row.paid ? "success" : "warning"}>
                        {row.paid ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4">
            <Button variant="outline" size="sm">
              {t("viewAll")}
            </Button>
          </div>
        </div>

        {/* Team activity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("activity")}</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              {t("viewAll")}
            </Button>
          </div>
          <div className="space-y-4">
            {ACTIVITY.map((item) => (
              <div key={item.who + item.ago} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted font-mono text-[10px] font-semibold uppercase">
                  {item.who.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.who}</span>{" "}
                    <span className="text-muted-foreground">{item.what}</span>
                    {item.tgt ? (
                      <span className="font-medium"> {item.tgt}</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.ago}
                  </span>
                  <span className="size-1.5 rounded-full bg-brand" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
