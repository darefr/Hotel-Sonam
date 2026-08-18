export function usd(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount
  if (isNaN(n)) return "$0"
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

// Backwards-friendly alias used across the app for currency display.
export const money = usd

export function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn + "T00:00:00")
  const b = new Date(checkOut + "T00:00:00")
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function formatDateTime(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

export function loyaltyTier(points: number) {
  if (points >= 5000) return "Platinum"
  if (points >= 2000) return "Gold"
  if (points >= 500) return "Silver"
  return "Bronze"
}

export function tierProgress(points: number) {
  const thresholds = [0, 500, 2000, 5000]
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"]
  let idx = 0
  for (let i = 0; i < thresholds.length; i++) if (points >= thresholds[i]) idx = i
  const current = tiers[idx]
  const next = tiers[idx + 1] ?? null
  const nextAt = thresholds[idx + 1] ?? null
  const base = thresholds[idx]
  const pct = nextAt ? Math.min(100, Math.round(((points - base) / (nextAt - base)) * 100)) : 100
  return { current, next, nextAt, pct }
}

export function daysUntil(date: string | Date) {
  const target = typeof date === "string" ? new Date(date + "T00:00:00") : date
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
