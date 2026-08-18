import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.DATABASE_URL)
const rows = await sql`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`
const byTable = {}
for (const r of rows) {
  ;(byTable[r.table_name] ??= []).push(`${r.column_name}:${r.data_type}`)
}
for (const [t, cols] of Object.entries(byTable)) {
  console.log(`\n== ${t} ==`)
  console.log(cols.join(", "))
}
