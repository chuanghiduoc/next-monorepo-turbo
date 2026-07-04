import { ImageResponse } from "next/og"

export const alt = "turbo/starter — Production Next.js monorepo boilerplate"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Dynamically generated Open Graph card for the landing surface. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {"{}"}
        </div>
        <span style={{ fontSize: 30, fontWeight: 600 }}>turbo/starter</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span
          style={{
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Ship the boring glue once. Reuse it forever.
        </span>
        <span style={{ fontSize: 28, color: "#94a3b8" }}>
          Next.js 16 · React 19 · Turborepo · three wired apps
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, fontSize: 22, color: "#64748b" }}>
        <span
          style={{
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid #1e293b",
            color: "#cbd5e1",
          }}
        >
          MIT licensed · clone and go
        </span>
      </div>
    </div>,
    { ...size }
  )
}
