import { expect, test } from "@playwright/test"

test.describe("auth flow", () => {
  test("unauthenticated visit to /dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
  })

  test("login form shows validation errors on empty submit", async ({
    page,
  }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })
})
