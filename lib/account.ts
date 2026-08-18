import "server-only"
import { sql, safeRead } from "./db"

/** All bookings for a guest, newest first, with room info. */
export async function getUserBookings(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT b.*, r.name AS room_name, r.slug AS room_slug, r.images AS room_images
        FROM bookings b
        LEFT JOIN rooms r ON r.id = b.room_id
        WHERE b.user_id = ${userId}
        ORDER BY b.check_in DESC
      `) as any[],
    [] as any[],
  )
}

export async function getBookingByReference(reference: string, userId: string) {
  return safeRead(async () => {
    const rows = await sql`
      SELECT b.*, r.name AS room_name, r.slug AS room_slug, r.images AS room_images
      FROM bookings b
      LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.reference = ${reference} AND b.user_id = ${userId}
      LIMIT 1
    `
    return (rows[0] as any) ?? null
  }, null as any)
}

/** Split bookings into upcoming vs past using check-out date and status. */
export function splitBookings(bookings: any[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming: any[] = []
  const past: any[] = []
  for (const b of bookings) {
    const out = new Date(b.check_out + "T00:00:00")
    const cancelled = b.status === "cancelled"
    if (!cancelled && out >= today && b.status !== "checked_out") upcoming.push(b)
    else past.push(b)
  }
  return { upcoming, past }
}

export async function getLoyaltyHistory(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT lt.*, b.reference AS booking_reference
        FROM loyalty_transactions lt
        LEFT JOIN bookings b ON b.id = lt.booking_id
        WHERE lt.user_id = ${userId}
        ORDER BY lt.created_at DESC
      `) as any[],
    [] as any[],
  )
}

export async function getWishlist(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT w.id AS wishlist_id, w.created_at AS saved_at, r.*
        FROM wishlist w
        JOIN rooms r ON r.id = w.item_id
        WHERE w.user_id = ${userId} AND w.kind = 'room'
        ORDER BY w.created_at DESC
      `) as any[],
    [] as any[],
  )
}

export async function getWishlistRoomIds(userId: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT item_id FROM wishlist WHERE user_id = ${userId} AND kind = 'room'`
    return (rows as any[]).map((r) => r.item_id as string)
  }, [] as string[])
}

export async function getUserReviews(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT rv.*, r.name AS room_name
        FROM reviews rv
        LEFT JOIN rooms r ON r.id = rv.room_id
        WHERE rv.user_id = ${userId}
        ORDER BY rv.created_at DESC
      `) as any[],
    [] as any[],
  )
}

/** Rooms a guest has stayed in (checked_out or past confirmed) and hasn't reviewed yet. */
export async function getReviewableStays(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT DISTINCT ON (r.id) r.id AS room_id, r.name AS room_name, b.reference, b.check_out
        FROM bookings b
        JOIN rooms r ON r.id = b.room_id
        WHERE b.user_id = ${userId}
          AND b.status IN ('confirmed','checked_out','checked_in')
          AND b.check_out <= CURRENT_DATE + INTERVAL '1 day'
          AND NOT EXISTS (
            SELECT 1 FROM reviews rv WHERE rv.user_id = ${userId} AND rv.room_id = r.id
          )
        ORDER BY r.id, b.check_out DESC
      `) as any[],
    [] as any[],
  )
}

export async function getUnreadNotifications(userId: string) {
  return safeRead(
    async () =>
      (await sql`
        SELECT * FROM notifications
        WHERE (user_id = ${userId} OR (audience = 'guest' AND user_id IS NULL))
        ORDER BY created_at DESC LIMIT 20
      `) as any[],
    [] as any[],
  )
}

/** Aggregate stats for the overview dashboard. */
export async function getGuestStats(userId: string) {
  return safeRead(
    async () => {
      const rows = await sql`
        SELECT
          COUNT(*)::int AS total_bookings,
          COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN nights ELSE 0 END), 0)::int AS total_nights,
          COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total ELSE 0 END), 0)::float AS total_spent
        FROM bookings WHERE user_id = ${userId}
      `
      return rows[0] as { total_bookings: number; total_nights: number; total_spent: number }
    },
    { total_bookings: 0, total_nights: 0, total_spent: 0 },
  )
}
