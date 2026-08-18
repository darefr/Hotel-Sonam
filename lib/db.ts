import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Lazily initialise the Neon client so a missing DATABASE_URL surfaces only when a
// query actually runs (not at module import), keeping builds and unrelated routes alive.
let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  _sql = neon(url)
  return _sql
}

// Tagged-template SQL client proxy. All queries are parameterized.
// Usage stays identical: sql`SELECT ...` and sql.query(text, params).
export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args: unknown[]) {
      // @ts-expect-error tagged-template + spread args forwarded to the real client
      return getSql()(...args)
    },
    get(_target, prop: string) {
      const client = getSql() as unknown as Record<string, unknown>
      const value = client[prop]
      return typeof value === "function" ? value.bind(client) : value
    },
  },
)

/** True when a database connection string is configured for this environment. */
export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

/**
 * Runs a read query and returns `fallback` if the DB is unconfigured or the query
 * fails, so public pages render (with empty states) instead of crashing. Write
 * paths must NOT use this — they should surface errors to the caller.
 */
export async function safeRead<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback
  try {
    return await fn()
  } catch (err) {
    console.log("[v0] safeRead query failed, using fallback:", (err as Error)?.message)
    return fallback
  }
}

export type Role = "GUEST" | "SUPER_ADMIN" | "ADMIN" | "FRONT_DESK" | "HOUSEKEEPING" | "RESTAURANT" | "MARKETING"

export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MARKETING"]
