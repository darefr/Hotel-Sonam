import "server-only"
import { sql } from "./db"

const ACTIVE_STATUSES = ["pending", "confirmed", "checked_in"]

/**
 * Counts overlapping active bookings for a room within a date range and
 * returns how many units remain available. Uses standard interval overlap:
 * existing.check_in < requested.check_out AND existing.check_out > requested.check_in
 */
export async function unitsAvailable(roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) {
  const roomRows = await sql`SELECT total_units FROM rooms WHERE id = ${roomId} LIMIT 1`
  if (roomRows.length === 0) return { total: 0, booked: 0, available: 0 }
  const total = Number(roomRows[0].total_units)

  const rows = await sql`
    SELECT COUNT(*)::int AS booked
    FROM bookings
    WHERE room_id = ${roomId}
      AND status = ANY(${ACTIVE_STATUSES})
      AND check_in < ${checkOut}
      AND check_out > ${checkIn}
      AND (${excludeBookingId ?? null}::uuid IS NULL OR id <> ${excludeBookingId ?? null}::uuid)
  `
  const booked = Number(rows[0].booked)
  return { total, booked, available: Math.max(0, total - booked) }
}

export async function isRoomAvailable(roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) {
  const { available } = await unitsAvailable(roomId, checkIn, checkOut, excludeBookingId)
  return available > 0
}

export const TAX_RATE = 0.13

export function computeQuote(rate: number | string, checkIn: string, checkOut: string) {
  const roomRate = Number(rate)
  const a = new Date(checkIn + "T00:00:00")
  const b = new Date(checkOut + "T00:00:00")
  const nights = Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000))
  const subtotal = roomRate * nights
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  return { roomRate, nights, subtotal, tax, total }
}

export type AvailableRoom = {
  id: string
  slug: string
  name: string
  description: string
  price: string
  capacity: number
  size_sqm: number | null
  beds: string | null
  images: string[]
  total_units: number
  booked: number
  available: number
}

/**
 * Returns all active rooms with their available-unit count for the given date range,
 * optionally filtered to rooms that can seat `guests`.
 */
export async function getAvailableRooms(checkIn: string, checkOut: string, guests = 1) {
  const rows = await sql`
    SELECT r.id, r.slug, r.name, r.description, r.price, r.capacity, r.size_sqm, r.beds, r.images, r.total_units,
      COALESCE((
        SELECT COUNT(*) FROM bookings b
        WHERE b.room_id = r.id
          AND b.status IN ('pending','confirmed','checked_in')
          AND b.check_in < ${checkOut}
          AND b.check_out > ${checkIn}
      ), 0)::int AS booked
    FROM rooms r
    WHERE r.status = 'active' AND r.capacity >= ${guests}
    ORDER BY r.sort, r.name
  `
  return (rows as any[]).map((r) => ({
    ...r,
    available: Math.max(0, Number(r.total_units) - Number(r.booked)),
  })) as AvailableRoom[]
}
