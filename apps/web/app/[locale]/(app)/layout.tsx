import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { getServerSession } from "@/lib/auth-server"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <div className="min-h-screen">{children}</div>
}
