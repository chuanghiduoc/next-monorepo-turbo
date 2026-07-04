import { Check } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await (
    await import("next-intl/server")
  ).getTranslations({ locale, namespace: "nav" })
  return { title: t("subscriptions") }
}

type Plan = {
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "/month",
    description: "For small teams getting started.",
    features: [
      "Up to 3 team members",
      "1 project",
      "Community support",
      "Basic analytics",
    ],
    cta: "Downgrade",
  },
  {
    name: "Team",
    price: "$29",
    cadence: "/month",
    description: "For growing teams that need more power.",
    features: [
      "Up to 25 team members",
      "Unlimited projects",
      "Priority email support",
      "Advanced analytics",
      "Custom integrations",
    ],
    cta: "Upgrade to Team",
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    cadence: "",
    description: "For organizations with advanced needs.",
    features: [
      "Unlimited team members",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom SLAs",
      "Onboarding & migration support",
    ],
    cta: "Contact Sales",
  },
]

const ADD_ONS = [
  {
    name: "Extra seats",
    description: "Add capacity beyond your plan's included seats.",
    price: "$8/seat/mo",
    enabled: true,
  },
  {
    name: "Advanced audit logs",
    description: "Retain and export detailed activity history for 12 months.",
    price: "$15/mo",
    enabled: true,
  },
  {
    name: "Premium support",
    description: "24/7 priority response with a dedicated Slack channel.",
    price: "$49/mo",
    enabled: false,
  },
]

export default function SubscriptionsPage() {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Subscriptions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that fits your team.
        </p>
      </div>

      {/* Billing cycle toggle (visual only) */}
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted p-1">
        <span className="rounded-full bg-card px-3 py-1 text-sm font-medium shadow-xs shadow-black/[0.03]">
          Monthly
        </span>
        <span className="rounded-full px-3 py-1 text-sm text-muted-foreground">
          Yearly
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]",
              plan.featured &&
                "border-brand shadow-md ring-1 shadow-brand/10 ring-brand/30"
            )}
          >
            {plan.featured && (
              <Badge variant="highlight" className="absolute -top-3 left-5">
                Most popular
              </Badge>
            )}

            <h3 className="text-sm font-semibold">{plan.name}</h3>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {plan.price}
              </span>
              {plan.cadence && (
                <span className="text-sm text-muted-foreground">
                  {plan.cadence}
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.description}
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.featured ? "default" : "outline"}
              className="mt-5 w-full"
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
        <h3 className="text-sm font-semibold">Add-ons</h3>
        <div className="mt-3 divide-y divide-border">
          {ADD_ONS.map((addOn) => (
            <div
              key={addOn.name}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{addOn.name}</p>
                <p className="text-sm text-muted-foreground">
                  {addOn.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {addOn.price}
                </span>
                <Badge variant={addOn.enabled ? "success" : "secondary"}>
                  {addOn.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
