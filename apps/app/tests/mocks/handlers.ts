import { http, HttpResponse } from "msw"

const PROXY_BASE = "http://localhost:3000/api"

export const handlers = [
  http.get(`${PROXY_BASE}/v1/health`, () =>
    HttpResponse.json({
      status: "ok",
      uptime: 42,
      timestamp: new Date().toISOString(),
    })
  ),

  http.get(`${PROXY_BASE}/auth/get-session`, () => HttpResponse.json(null)),

  http.post(`${PROXY_BASE}/auth/sign-in/email`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({
        user: { id: "u_1", email: body.email, name: "Test User" },
      })
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    )
  }),
]
