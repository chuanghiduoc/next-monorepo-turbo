import { describe, expect, it } from "vitest"

import { loginSchema, registerSchema } from "@/lib/validation/auth"

describe("loginSchema", () => {
  it("accepts a valid email + 8-char password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"])
    }
  })

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"])
    }
  })
})

describe("registerSchema", () => {
  it("accepts a valid name + email + password", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "ada@example.com",
      password: "password123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"])
    }
  })
})
