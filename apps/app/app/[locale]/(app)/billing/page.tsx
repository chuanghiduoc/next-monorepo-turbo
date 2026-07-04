import { Download } from "lucide-react"
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

type InvoiceStatus = "Paid" | "Pending"

type Invoice = {
  id: string
  date: string
  amount: string
  status: InvoiceStatus
}

const STATUS_VARIANT: Record<InvoiceStatus, "success" | "warning"> = {
  Paid: "success",
  Pending: "warning",
}

const INVOICES: Invoice[] = [
  { id: "INV-0006", date: "Jun 10, 2025", amount: "$49.00", status: "Paid" },
  { id: "INV-0005", date: "May 10, 2025", amount: "$49.00", status: "Paid" },
  { id: "INV-0004", date: "Apr 10, 2025", amount: "$49.00", status: "Paid" },
  { id: "INV-0003", date: "Mar 10, 2025", amount: "$49.00", status: "Paid" },
  { id: "INV-0002", date: "Feb 10, 2025", amount: "$49.00", status: "Paid" },
  { id: "INV-0001", date: "Jan 10, 2025", amount: "$49.00", status: "Pending" },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("billing") }
}

export default async function BillingPage() {
  const t = await getTranslations("nav")

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("billing")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, payment method, and invoices.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Current Plan</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-xl font-semibold">
                  Pro Plan
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    $49
                  </span>{" "}
                  / month
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Renews on <span className="tabular-nums">Jul 10, 2025</span>
              </p>
            </div>
            <Badge variant="brand">Active</Badge>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seats used</span>
              <span className="font-medium tabular-nums">8 / 10</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-4/5 rounded-full bg-brand" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
            <Button size="sm">Change Plan</Button>
            <Button variant="outline" size="sm">
              Cancel Plan
            </Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <h3 className="text-sm font-semibold">Payment Method</h3>
          <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="h-6 w-9 rounded-sm bg-white/20" />
              <span className="text-xs font-semibold tracking-wide">VISA</span>
            </div>
            <p className="mt-6 font-mono text-sm tracking-widest">
              •••• •••• •••• 4242
            </p>
            <p className="mt-2 text-xs text-white/70">
              Expires <span className="tabular-nums">08/27</span>
            </p>
          </div>
          <Button variant="outline" className="mt-4 w-full">
            Update
          </Button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
        <h3 className="mb-4 text-sm font-semibold">Invoices</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {invoice.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download ${invoice.id}`}
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
