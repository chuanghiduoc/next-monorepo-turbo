import { expect, test } from "@playwright/test"

test.describe("auth flow", () => {
  test("unauthenticated visit to /dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
    // Locale-agnostic: the sign-in form (email field, labelled "Email" in both
    // locales) is present after the redirect.
    await expect(page.getByLabel("Email")).toBeVisible()
  })

  test("login form shows validation errors on empty submit", async ({
    page,
  }) => {
    await page.goto("/login")
    await page.locator('button[type="submit"]').click()
    // react-hook-form marks the offending field aria-invalid — locale-agnostic.
    await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible()
  })
})
