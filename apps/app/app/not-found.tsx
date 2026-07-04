import Link from "next/link"

/**
 * Root 404 for paths that never reach the locale layout. Renders standalone
 * markup (no root layout wraps it in this next-intl setup).
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              margin: 0,
              color: "#2563eb",
            }}
          >
            404
          </p>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: 14 }}>
            This page could not be found.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "1.25rem",
              color: "#2563eb",
              fontSize: 14,
            }}
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  )
}
