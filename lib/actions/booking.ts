"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { sql } from "@/lib/db"
import { getSession, bookingReference } from "@/lib/auth"
import { bookingSchema } from "@/lib/validation"
import { computeQuote, getAvailableRooms, type AvailableRoom } from "@/lib/bookings"
import { loyaltyTier } from "@/lib/format"
import { rateLimit } from "@/lib/rate-limit"
import {
  sendMail,
  bookingConfirmationEmail,
  ownerBookingEmail,
} from "@/lib/email"

const OWNER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "hotelsonam@gmail.com"

export type SearchResult = { rooms: AvailableRoom[]; checkIn: string; checkOut: string; guests: number; nights: number; error?: string }

function validDates(checkIn: string, checkOut: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const a = new Date(checkIn + "T00:00:00")
  const b = new Date(checkOut + "T00:00:00")
  return a >= today && b > a
}

/** Client-callable availability search used by the booking wizard. */
export async function searchAvailability(checkIn: string, checkOut: string, guests: number): Promise<SearchResult> {
  const g = Math.max(1, Math.min(20, Math.floor(guests || 1)))
  if (!validDates(checkIn, checkOut)) {
    return { rooms: [], checkIn, checkOut, guests: g, nights: 0, error: "Please choose valid check-in and check-out dates." }
  }
  const { nights } = computeQuote(0, checkIn, checkOut)
  const rooms = await getAvailableRooms(checkIn, checkOut, g)
  return { rooms, checkIn, checkOut, guests: g, nights }
}

export type BookingState = { error?: string }

export async function createBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "anon"
  if (!rateLimit(`book:${ip}`, 10, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = bookingSchema.safeParse({
    roomId: String(formData.get("roomId") ?? ""),
    checkIn: String(formData.get("checkIn") ?? ""),
    checkOut: String(formData.get("checkOut") ?? ""),
    guests: Number(formData.get("guests") ?? 1),
    guestName: String(formData.get("guestName") ?? ""),
    guestEmail: String(formData.get("guestEmail") ?? ""),
    guestPhone: String(formData.get("guestPhone") ?? ""),
    specialRequests: String(formData.get("specialRequests") ?? ""),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details." }
  const b = parsed.data

  if (!validDates(b.checkIn, b.checkOut)) return { error: "Please choose valid dates (check-out must be after check-in)." }

  // Load the room and recompute price server-side — never trust client totals.
  const roomRows = await sql`SELECT id, name, price, capacity FROM rooms WHERE id = ${b.roomId} AND status = 'active' LIMIT 1`
  const room = roomRows[0]
  if (!room) return { error: "That room is no longer available." }
  if (b.guests > Number(room.capacity)) return { error: `This room sleeps up to ${room.capacity} guests.` }

  const quote = computeQuote(room.price, b.checkIn, b.checkOut)
  if (quote.nights < 1) return { error: "Please book at least one night." }

  const session = await getSession()
  const reference = bookingReference()

  // Atomic insert guarded by an availability check in the same statement — prevents
  // double-booking / overbooking under concurrency.
  let inserted: any[]
  try {
    inserted = await sql`
      INSERT INTO bookings
        (reference, user_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
         guests, nights, room_rate, subtotal, tax, total, special_requests, status, source)
      SELECT ${reference}, ${session?.id ?? null}, ${b.roomId}, ${b.guestName}, ${b.guestEmail},
             ${b.guestPhone || null}, ${b.checkIn}, ${b.checkOut}, ${b.guests}, ${quote.nights},
             ${quote.roomRate}, ${quote.subtotal}, ${quote.tax}, ${quote.total},
             ${b.specialRequests || null}, 'confirmed', 'online'
      WHERE (SELECT total_units FROM rooms WHERE id = ${b.roomId}) > (
        SELECT COUNT(*) FROM bookings x
        WHERE x.room_id = ${b.roomId}
          AND x.status IN ('pending','confirmed','checked_in')
          AND x.check_in < ${b.checkOut}
          AND x.check_out > ${b.checkIn}
      )
      RETURNING id, reference
    `
  } catch (e) {
    console.error("[booking] insert failed:", (e as Error).message)
    return { error: "We couldn't complete your booking. Please try again." }
  }

  if (inserted.length === 0) {
    return { error: "Sorry — this room was just booked for those dates. Please choose different dates or another room." }
  }
  const bookingId = inserted[0].id

  // Loyalty accrual for signed-in guests (1 point per $1 spent).
  if (session?.id) {
    const points = Math.floor(quote.total)
    try {
      await sql`
        INSERT INTO loyalty_transactions (user_id, points, reason, booking_id)
        VALUES (${session.id}, ${points}, ${`Booking ${reference}`}, ${bookingId})
      `
      const totRows = await sql`
        UPDATE users SET loyalty_points = loyalty_points + ${points}, updated_at = now()
        WHERE id = ${session.id} RETURNING loyalty_points
      `
      const newTotal = Number(totRows[0]?.loyalty_points ?? points)
      await sql`UPDATE users SET loyalty_tier = ${loyaltyTier(newTotal)} WHERE id = ${session.id}`
    } catch (e) {
      console.error("[booking] loyalty failed:", (e as Error).message)
    }
  }

  const emailData = {
    reference,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    guestPhone: b.guestPhone,
    roomName: room.name as string,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    total: quote.total,
    paymentStatus: "Pay at hotel",
    status: "Confirmed",
    specialRequests: b.specialRequests,
  }

  await Promise.allSettled([
    sendMail({ to: b.guestEmail, subject: `Your booking is confirmed — ${reference}`, html: bookingConfirmationEmail(emailData) }),
    sendMail({ to: OWNER_EMAIL, subject: `New booking — ${reference}`, html: ownerBookingEmail(emailData) }),
    sql`INSERT INTO notifications (audience, title, body, type) VALUES ('admin', ${`New booking ${reference}`}, ${`${b.guestName} · ${room.name} · ${b.checkIn} → ${b.checkOut}`}, 'booking')`,
    session?.id
      ? sql`INSERT INTO notifications (user_id, audience, title, body, type) VALUES (${session.id}, 'guest', ${`Booking confirmed — ${reference}`}, ${`${room.name}, ${b.checkIn} → ${b.checkOut}`}, 'booking')`
      : Promise.resolve(),
  ])

  redirect(`/book/confirmation/${reference}`)
}
