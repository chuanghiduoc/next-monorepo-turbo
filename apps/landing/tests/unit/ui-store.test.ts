import { beforeEach, describe, expect, it } from "vitest"

import { useUIStore } from "@/lib/stores/ui-store"

describe("useUIStore", () => {
  beforeEach(() => {
    // Reset to the initial state between tests (store is a module singleton).
    useUIStore.setState({ sidebarCollapsed: false })
  })

  it("starts with the sidebar expanded", () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })

  it("toggleSidebar flips the collapsed flag", () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })

  it("setSidebarCollapsed sets the flag explicitly", () => {
    useUIStore.getState().setSidebarCollapsed(true)
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })
})
