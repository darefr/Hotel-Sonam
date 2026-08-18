import { NextResponse } from "next/server"
import { sql, isDbConfigured } from "@/lib/db"
import { requireStaff } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  // Diagnostics expose table counts, env key names and admin emails — staff only.
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const out: Record<string, unknown> = { dbConfigured: isDbConfigured() }
  out.envKeys = Object.keys(process.env)
    .filter((k) => /DATABASE|POSTGRES|NEON|PG|SUPABASE|AUTH_SECRET|SMTP|MAIL|WHATSAPP|AI_GATEWAY|BLOB/i.test(k))
    .sort()
  const tables = [
    "users", "rooms", "bookings", "menu_categories", "menu_items", "offers",
    "experiences", "attractions", "gallery", "faqs", "reviews", "cms_content",
    "wishlist", "waitlist", "notifications", "loyalty_transactions", "contact_messages",
  ]
  for (const t of tables) {
    try {
      const r = await sql.query(`SELECT COUNT(*)::int AS c FROM ${t}`)
      out[t] = r[0].c
    } catch (e) {
      out[t] = `ERR ${(e as Error).message}`
    }
  }
  try {
    out.reviewStatuses = await sql`SELECT status, COUNT(*)::int c FROM reviews GROUP BY status`
    out.admins = await sql`SELECT email, role FROM users WHERE role != 'GUEST'`
  } catch (e) {
    out.metaErr = (e as Error).message
  }
  return NextResponse.json(out)
}
