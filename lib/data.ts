import "server-only"
import { sql, safeRead } from "./db"

export type Room = {
  id: string
  slug: string
  name: string
  description: string
  long_description: string | null
  price: string
  capacity: number
  size_sqm: number | null
  beds: string | null
  total_units: number
  amenities: string[]
  images: string[]
  featured: boolean
  status: string
  sort: number
}

export async function getRooms(opts: { includeHidden?: boolean } = {}) {
  return safeRead(
    async () =>
      (opts.includeHidden
        ? await sql`SELECT * FROM rooms ORDER BY sort, name`
        : await sql`SELECT * FROM rooms WHERE status = 'active' ORDER BY sort, name`) as unknown as Room[],
    [] as Room[],
  )
}

export async function getRoomBySlug(slug: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT * FROM rooms WHERE slug = ${slug} LIMIT 1`
    return (rows[0] as unknown as Room) ?? null
  }, null as Room | null)
}

export async function getRoomById(id: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT * FROM rooms WHERE id = ${id} LIMIT 1`
    return (rows[0] as unknown as Room) ?? null
  }, null as Room | null)
}

export async function getFeaturedRooms() {
  return safeRead(
    async () =>
      (await sql`SELECT * FROM rooms WHERE status = 'active' ORDER BY featured DESC, sort LIMIT 3`) as unknown as Room[],
    [] as Room[],
  )
}

export async function getMenu() {
  return safeRead(async () => {
    const cats = await sql`SELECT * FROM menu_categories ORDER BY sort, name`
    const items = await sql`SELECT * FROM menu_items WHERE available = TRUE ORDER BY sort, name`
    return (cats as any[]).map((c) => ({
      ...c,
      items: (items as any[]).filter((i) => i.category_id === c.id),
    }))
  }, [] as any[])
}

export async function getFeaturedDishes() {
  return safeRead(
    async () =>
      (await sql`SELECT * FROM menu_items WHERE featured = TRUE AND available = TRUE ORDER BY sort LIMIT 4`) as any[],
    [] as any[],
  )
}

export async function getOffers(activeOnly = true) {
  return safeRead(
    async () =>
      (activeOnly
        ? await sql`SELECT * FROM offers WHERE active = TRUE ORDER BY created_at DESC`
        : await sql`SELECT * FROM offers ORDER BY created_at DESC`) as any[],
    [] as any[],
  )
}

export async function getExperiences() {
  return safeRead(async () => (await sql`SELECT * FROM experiences ORDER BY sort, title`) as any[], [] as any[])
}

export async function getAttractions() {
  return safeRead(async () => (await sql`SELECT * FROM attractions ORDER BY sort, title`) as any[], [] as any[])
}

export async function getGallery() {
  return safeRead(async () => (await sql`SELECT * FROM gallery ORDER BY sort`) as any[], [] as any[])
}

export async function getFaqs() {
  return safeRead(async () => (await sql`SELECT * FROM faqs ORDER BY sort, question`) as any[], [] as any[])
}

export async function getApprovedReviews(limit = 12) {
  return safeRead(
    async () =>
      (await sql`
        SELECT r.*, ro.name AS room_name
        FROM reviews r
        LEFT JOIN rooms ro ON ro.id = r.room_id
        WHERE r.status = 'approved'
        ORDER BY r.created_at DESC
        LIMIT ${limit}
      `) as any[],
    [] as any[],
  )
}

export async function getReviewStats() {
  return safeRead(
    async () => {
      const rows = await sql`
        SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS avg
        FROM reviews WHERE status = 'approved'
      `
      return rows[0] as { count: number; avg: number }
    },
    { count: 0, avg: 0 } as { count: number; avg: number },
  )
}

export async function getCmsContent(key: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT value FROM cms_content WHERE key = ${key} LIMIT 1`
    return (rows[0]?.value as any) ?? null
  }, null as any)
}

export async function getSiteInfo() {
  const about = await getCmsContent("about")
  const hero = await getCmsContent("hero")
  return { about, hero }
}
