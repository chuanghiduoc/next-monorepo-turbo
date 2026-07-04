"use client"

import { useEffect } from "react"

import { useUIStore } from "@/lib/stores/ui-store"

export function StoreHydration() {
  useEffect(() => {
    void useUIStore.persist.rehydrate()
  }, [])
  return null
}
