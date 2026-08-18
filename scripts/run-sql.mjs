import { neon } from "@neondatabase/serverless"
import { readFileSync } from "node:fs"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL not set")
  process.exit(1)
}
const file = process.argv[2]
if (!file) {
  console.error("Usage: node run-sql.mjs <file.sql>")
  process.exit(1)
}
const sql = neon(url)
const raw = readFileSync(file, "utf8")

// Strip full-line comments first, then split on statement-terminating semicolons.
const cleaned = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")

const statements = cleaned
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

for (const stmt of statements) {
  try {
    await sql.query(stmt)
  } catch (e) {
    console.error("Failed statement:\n", stmt.slice(0, 120), "\n", e.message)
    process.exit(1)
  }
}
console.log(`Applied ${statements.length} statements from ${file}`)
