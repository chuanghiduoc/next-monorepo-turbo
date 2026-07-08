import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Liveness probe for this Next app — independent of the backend on purpose, so
// orchestrators see the web process is up even while the backend is down.
export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
