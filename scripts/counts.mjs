import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.DATABASE_URL)
const tables = ["users","rooms","bookings","menu_categories","menu_items","offers","experiences","attractions","gallery","faqs","reviews","site_content","cms_content","settings","wishlist","waitlist","notifications","loyalty_transactions"]
for (const t of tables) {
  try {
    const r = await sql.query(`SELECT COUNT(*)::int AS c FROM ${t}`)
    console.log(t, "=>", r[0].c)
  } catch (e) {
    console.log(t, "ERR", e.message)
  }
}
// sample rooms
const rooms = await sql`SELECT slug, name, price, total_units, status FROM rooms ORDER BY sort LIMIT 10`
console.log("\nROOMS:", JSON.stringify(rooms, null, 1))
const roles = await sql`SELECT email, role, email_verified FROM users LIMIT 10`
console.log("\nUSERS:", JSON.stringify(roles, null, 1))
