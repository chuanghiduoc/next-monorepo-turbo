import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getServerSession } from "@/lib/auth-server"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  const name = session.user.name ?? ""
  const email = session.user.email ?? ""

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-svh overflow-hidden"
    >
      <AdminSidebar />
      <SidebarInset className="flex min-w-0 flex-col overflow-hidden">
        <AdminHeader name={name} email={email} />
        {/* Only this region scrolls — the sidebar and header stay fixed. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
