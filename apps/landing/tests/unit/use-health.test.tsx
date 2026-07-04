import { useHealth } from "@workspace/api-client"
import { describe, expect, it } from "vitest"

import { renderWithProviders, screen, waitFor } from "../test-utils"

function HealthProbe() {
  const { data, isLoading } = useHealth()
  if (isLoading) return <p>loading</p>
  return <p data-testid="status">{data?.status}</p>
}

describe("useHealth", () => {
  it("returns ok status from the mocked backend", async () => {
    renderWithProviders(<HealthProbe />)
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ok")
    })
  })
})
