import { CreditCard, Download } from "lucide-react"

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await (
    await import("next-intl/server")
  ).getTranslations({ locale, namespace: "nav" })
  return { title: t("billing") }
}

const SEATS_USED = 8
const SEATS_TOTAL = 10
const USAGE_PCT = Math.round((SEATS_USED / SEATS_TOTAL) * 100)

const INVOICES = [
  { id: "INV-2025-006", date: "Jun 10, 2025", amount: "$49.00", paid: true },
  { id: "INV-2025-005", date: "May 10, 2025", amount: "$49.00", paid: true },
  { id: "INV-2025-004", date: "Apr 10, 2025", amount: "$49.00", paid: true },
  { id: "INV-2025-003", date: "Mar 10, 2025", amount: "$49.00", paid: false },
  { id: "INV-2025-002", date: "Feb 10, 2025", amount: "$49.00", paid: true },
  { id: "INV-2025-001", date: "Jan 10, 2025", amount: "$49.00", paid: true },
]

export default function BillingPage() {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, payment method, and invoices.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Current Plan</h3>
            <Badge variant="brand">Active</Badge>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">Pro Plan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              $49
            </span>
            /month · renews Jul 10, 2025
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {SEATS_USED} of {SEATS_TOTAL} seats used
              </span>
              <span className="font-medium tabular-nums">{USAGE_PCT}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${USAGE_PCT}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Button>Change Plan</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-1">
          <h3 className="text-sm font-semibold">Payment Method</h3>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-foreground p-4 text-background">
            <span className="text-sm font-medium tracking-wide">
              VISA •••• 4242
            </span>
            <CreditCard className="size-5 opacity-80" />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">Expires 08/27</p>

          <Button variant="outline" className="mt-4 w-full">
            Update
          </Button>
        </div>
      </div>

      {/* Invoices */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs shadow-black/[0.03]">
        <div className="p-5">
          <h3 className="text-sm font-semibold">Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="pr-5 text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                    {inv.id}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.date}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {inv.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={inv.paid ? "success" : "warning"}>
                      {inv.paid ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download ${inv.id}`}
                    >
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
