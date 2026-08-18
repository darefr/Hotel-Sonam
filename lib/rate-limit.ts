import "server-only"

// Lightweight in-memory rate limiter for OTP/resend and auth endpoints.
// Sufficient for a single-instance deployment; swap for Upstash if scaling out.
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count++
  return { ok: true, remaining: limit - b.count }
}

// Periodic cleanup to avoid unbounded growth.
if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { __htp_rl_timer?: ReturnType<typeof setInterval> }
  if (!g.__htp_rl_timer) {
    g.__htp_rl_timer = setInterval(() => {
      const now = Date.now()
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
    }, 60_000)
  }
}
