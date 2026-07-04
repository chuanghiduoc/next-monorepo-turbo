import {
  BarChart3,
  Bug,
  Download,
  GitBranch,
  Globe,
  Hash,
  KeyRound,
  Mail,
  MessageSquare,
  Bell as NotificationsIcon,
  ArrowRight,
  AtSign,
  ListChecks,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { SettingsNav } from "@/components/settings/settings-nav"
import {
  SettingsToggleList,
  type SettingsToggleItem,
} from "@/components/settings/settings-toggle-list"
import { Link } from "@/i18n/navigation"

const NOTIFICATION_ITEMS: SettingsToggleItem[] = [
  {
    id: "notif-project-updates",
    icon: <NotificationsIcon className="size-4" />,
    title: "Project updates",
    description: "Get notified when a project you're part of is updated.",
    defaultChecked: true,
  },
  {
    id: "notif-team-mentions",
    icon: <AtSign className="size-4" />,
    title: "Team mentions",
    description: "Get notified when someone mentions you in a comment.",
    defaultChecked: true,
  },
  {
    id: "notif-task-assignments",
    icon: <ListChecks className="size-4" />,
    title: "Task assignments",
    description: "Get notified when a task is assigned to you.",
    defaultChecked: true,
  },
  {
    id: "notif-comments",
    icon: <MessageSquare className="size-4" />,
    title: "Comments",
    description: "Get notified about new comments on your tasks.",
    defaultChecked: true,
  },
  {
    id: "notif-weekly-digest",
    icon: <Mail className="size-4" />,
    title: "Weekly digest",
    description: "Receive a weekly summary of your workspace activity.",
    defaultChecked: false,
  },
]

const PRIVACY_ITEMS: SettingsToggleItem[] = [
  {
    id: "privacy-analytics",
    icon: <BarChart3 className="size-4" />,
    title: "Analytics & Usage",
    description: "Help us improve OrbitOps by sharing anonymous usage data.",
    defaultChecked: true,
  },
  {
    id: "privacy-error-reporting",
    icon: <Bug className="size-4" />,
    title: "Error Reporting",
    description: "Automatically send crash reports to help us fix issues.",
    defaultChecked: true,
  },
  {
    id: "privacy-discoverable",
    icon: <Globe className="size-4" />,
    title: "Make workspace discoverable",
    description: "Allow other OrbitOps users to find and request to join.",
    defaultChecked: false,
  },
  {
    id: "privacy-data-export",
    icon: <Download className="size-4" />,
    title: "Allow data export",
    description: "Let workspace admins export data to CSV or JSON.",
    defaultChecked: true,
  },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await (
    await import("next-intl/server")
  ).getTranslations({
    locale,
    namespace: "nav",
  })
  return { title: t("settings") }
}

export default function SettingsPage() {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace preferences and configuration.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <SettingsNav />

        <div className="min-w-0 flex-1 space-y-6">
          {/* General Settings */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
            <h2 className="text-sm font-semibold">General Settings</h2>

            <div className="mt-4 space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  defaultValue="OrbitOps"
                  className="max-w-md"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue="support@orbitops.io"
                  className="max-w-md"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Customers will see this address on invoices and support
                  emails.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pacific">
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pacific">
                        (UTC-07:00) Pacific Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="mountain">
                        (UTC-06:00) Mountain Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="central">
                        (UTC-05:00) Central Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="eastern">
                        (UTC-04:00) Eastern Time (US & Canada)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mmm-d-yyyy">
                    <SelectTrigger id="date-format" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mmm-d-yyyy">
                        MMM D, YYYY (Jun 10, 2025)
                      </SelectItem>
                      <SelectItem value="d-mmm-yyyy">
                        D MMM YYYY (10 Jun 2025)
                      </SelectItem>
                      <SelectItem value="iso">
                        YYYY-MM-DD (2025-06-10)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="brand-color">Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-9 shrink-0 rounded bg-brand"
                    />
                    <Input
                      id="brand-color"
                      defaultValue="#2563EB"
                      className="max-w-[160px]"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This color will be used across the platform.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select defaultValue="en-us">
                    <SelectTrigger id="default-language" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-us">English (US)</SelectItem>
                      <SelectItem value="en-gb">English (UK)</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="button">Save Changes</Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {/* Notification Preferences */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
              <h2 className="text-sm font-semibold">
                Notification Preferences
              </h2>
              <SettingsToggleList items={NOTIFICATION_ITEMS} />
            </div>

            {/* Privacy & Data */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
              <h2 className="text-sm font-semibold">Privacy & Data</h2>
              <SettingsToggleList items={PRIVACY_ITEMS} />
            </div>
          </div>

          {/* Integrations & API */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
            <h2 className="text-sm font-semibold">Integrations & API</h2>

            <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <KeyRound className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage API keys to access the OrbitOps API.
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" className="sm:shrink-0">
                Manage API Keys
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Connected Integrations
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Hash className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Slack</p>
                      <p className="text-sm text-muted-foreground">
                        Connected · 2 workspaces
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:shrink-0"
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <GitBranch className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">GitHub</p>
                      <p className="text-sm text-muted-foreground">
                        Connected as orbitops
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:shrink-0"
                  >
                    Manage
                  </Button>
                </div>
              </div>

              <Link
                href="/integrations"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                View all integrations
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/40 bg-destructive/[0.03] p-5 shadow-xs shadow-black/[0.03]">
            <h2 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Delete Workspace</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Permanently delete your workspace and all associated data.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="sm:shrink-0"
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
