import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

/**
 * Locale-aware navigation helpers. Public API surface — some helpers
 * (Link, getPathname) are consumed lazily by feature code.
 * @public
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
