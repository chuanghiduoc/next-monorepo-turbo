#!/usr/bin/env node
/**
 * Remove an app from the monorepo boilerplate.
 *
 * Usage:
 *   pnpm remove-app <name> [--yes]
 *
 * Deletes apps/<name> and cleans up every place the app is referenced so the
 * workspace stays consistent: knip workspaces, changeset ignore list, and the
 * docker-compose service block. Runs `pnpm install` afterwards to refresh the
 * lockfile. Refuses to remove the last remaining app.
 */
import { execSync } from "node:child_process"
import { createInterface } from "node:readline"
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const appsDir = join(repoRoot, "apps")

function listApps() {
  return readdirSync(appsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function fail(message) {
  console.error(`✖ ${message}`)
  process.exit(1)
}

const args = process.argv.slice(2)
const skipConfirm = args.includes("--yes") || args.includes("-y")
const name = args.find((arg) => !arg.startsWith("-"))
const apps = listApps()

if (!name) {
  console.log("Usage: pnpm remove-app <name> [--yes]")
  console.log(`Available apps: ${apps.join(", ")}`)
  process.exit(apps.length ? 0 : 1)
}

if (!apps.includes(name)) {
  fail(`App "${name}" not found. Available: ${apps.join(", ")}`)
}

if (apps.length <= 1) {
  fail(`Cannot remove "${name}" — it is the only app left in the workspace.`)
}

async function confirm() {
  if (skipConfirm || !process.stdin.isTTY) return true
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise((resolve) =>
    rl.question(`Remove app "${name}" and its references? [y/N] `, resolve)
  )
  rl.close()
  return /^y(es)?$/i.test(answer.trim())
}

/** Remove `name` from a JSON array field, writing the file back if changed. */
function pruneJsonArray(filePath, mutate) {
  if (!existsSync(filePath)) return
  const raw = readFileSync(filePath, "utf8")
  const data = JSON.parse(raw)
  if (mutate(data)) {
    writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
    console.log(
      `  cleaned ${filePath.replace(`${repoRoot}\\`, "").replace(`${repoRoot}/`, "")}`
    )
  }
}

/** Remove the top-level docker-compose service block named `name`. */
function pruneComposeService(filePath) {
  if (!existsSync(filePath)) return
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/)
  const out = []
  let skipping = false
  for (const line of lines) {
    const isServiceHeader = /^ {2}\S.*:\s*$/.test(line)
    if (isServiceHeader) skipping = new RegExp(`^ {2}${name}:\\s*$`).test(line)
    if (!skipping) out.push(line)
  }
  const next = out.join("\n").replace(/\n{3,}/g, "\n\n")
  writeFileSync(filePath, next)
  console.log("  cleaned docker-compose.yml")
}

if (!(await confirm())) {
  console.log("Aborted.")
  process.exit(0)
}

console.log(`Removing app "${name}"...`)
rmSync(join(appsDir, name), { recursive: true, force: true })
console.log(`  deleted apps/${name}`)

pruneJsonArray(join(repoRoot, "knip.json"), (data) => {
  if (data.workspaces && `apps/${name}` in data.workspaces) {
    delete data.workspaces[`apps/${name}`]
    return true
  }
  return false
})

pruneJsonArray(join(repoRoot, ".changeset", "config.json"), (data) => {
  if (Array.isArray(data.ignore) && data.ignore.includes(name)) {
    data.ignore = data.ignore.filter((entry) => entry !== name)
    return true
  }
  return false
})

pruneComposeService(join(repoRoot, "docker-compose.yml"))

console.log("Refreshing lockfile with pnpm install...")
execSync("pnpm install", { cwd: repoRoot, stdio: "inherit" })

console.log(`✔ App "${name}" removed.`)
