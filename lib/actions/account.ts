"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { getSession, hashPassword, verifyPassword } from "@/lib/auth"

export type ActionState = { error?: string; success?: string }

/** Update the guest's contact profile. */
export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: "Please sign in." }

  const name = String(formData.get("name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const whatsapp = String(formData.get("whatsapp") ?? "").trim()
  if (name.length < 2) return { error: "Please enter your full name." }

  try {
    await sql`
      UPDATE users SET name = ${name}, phone = ${phone || null}, whatsapp = ${whatsapp || null}, updated_at = now()
      WHERE id = ${session.id}
    `
  } catch (e) {
    console.error("[account] updateProfile:", (e as Error).message)
    return { error: "Could not save your profile. Please try again." }
  }
  revalidatePath("/account/profile")
  revalidatePath("/account")
  return { success: "Profile updated." }
}

/** Save stay preferences as JSON on the user record. */
export async function updatePreferences(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: "Please sign in." }

  const preferences = {
    bedType: String(formData.get("bedType") ?? ""),
    floor: String(formData.get("floor") ?? ""),
    dietary: String(formData.get("dietary") ?? ""),
    smoking: formData.get("smoking") === "on",
    newsletter: formData.get("newsletter") === "on",
    notes: String(formData.get("notes") ?? "").slice(0, 500),
  }

  try {
    await sql`UPDATE users SET preferences = ${JSON.stringify(preferences)}::jsonb, updated_at = now() WHERE id = ${session.id}`
  } catch (e) {
    console.error("[account] updatePreferences:", (e as Error).message)
    return { error: "Could not save preferences." }
  }
  revalidatePath("/account/preferences")
  return { success: "Preferences saved." }
}

/** Change password after verifying the current one. */
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: "Please sign in." }

  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("next") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  if (next.length < 8) return { error: "New password must be at least 8 characters." }
  if (next !== confirm) return { error: "New passwords do not match." }

  try {
    const rows = await sql`SELECT password_hash FROM users WHERE id = ${session.id} LIMIT 1`
    const hash = rows[0]?.password_hash as string | undefined
    if (!hash || !(await verifyPassword(current, hash))) return { error: "Your current password is incorrect." }
    await sql`UPDATE users SET password_hash = ${await hashPassword(next)}, updated_at = now() WHERE id = ${session.id}`
  } catch (e) {
    console.error("[account] changePassword:", (e as Error).message)
    return { error: "Could not change password." }
  }
  return { success: "Password changed." }
}

/** Toggle a room in the guest's wishlist. Returns the new saved state. */
export async function toggleWishlist(roomId: string): Promise<{ saved: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { saved: false, error: "Please sign in to save favorites." }
  try {
    const existing = await sql`SELECT id FROM wishlist WHERE user_id = ${session.id} AND kind = 'room' AND item_id = ${roomId} LIMIT 1`
    if (existing.length > 0) {
      await sql`DELETE FROM wishlist WHERE user_id = ${session.id} AND kind = 'room' AND item_id = ${roomId}`
      revalidatePath("/account/wishlist")
      return { saved: false }
    }
    await sql`INSERT INTO wishlist (user_id, kind, item_id) VALUES (${session.id}, 'room', ${roomId}) ON CONFLICT DO NOTHING`
    revalidatePath("/account/wishlist")
    return { saved: true }
  } catch (e) {
    console.error("[account] toggleWishlist:", (e as Error).message)
    return { saved: false, error: "Could not update your wishlist." }
  }
}

/** Submit a guest review (pending moderation). Requires a matching stay. */
export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: "Please sign in." }

  const roomId = String(formData.get("roomId") ?? "") || null
  const rating = Number(formData.get("rating") ?? 0)
  const title = String(formData.get("title") ?? "").trim().slice(0, 120)
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000)
  if (rating < 1 || rating > 5) return { error: "Please choose a rating from 1 to 5 stars." }
  if (body.length < 10) return { error: "Please write a little more about your stay." }

  try {
    const userRows = await sql`SELECT name FROM users WHERE id = ${session.id} LIMIT 1`
    const author = (userRows[0]?.name as string) ?? "Guest"
    await sql`
      INSERT INTO reviews (user_id, room_id, guest_name, rating, title, body, status)
      VALUES (${session.id}, ${roomId}, ${author}, ${rating}, ${title || ""}, ${body}, 'pending')
    `
  } catch (e) {
    console.error("[account] submitReview:", (e as Error).message)
    return { error: "Could not submit your review." }
  }
  revalidatePath("/account/reviews")
  return { success: "Thank you! Your review has been submitted for moderation." }
}

/** Guest-initiated cancellation (only allowed while pending/confirmed and before check-in). */
export async function cancelBooking(reference: string): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: "Please sign in." }
  try {
    const rows = await sql`
      SELECT id, check_in, status FROM bookings
      WHERE reference = ${reference} AND user_id = ${session.id} LIMIT 1
    `
    const b = rows[0]
    if (!b) return { error: "Booking not found." }
    if (!["pending", "confirmed"].includes(b.status)) return { error: "This booking can no longer be cancelled online." }
    const checkIn = new Date(b.check_in + "T00:00:00")
    const now = new Date()
    const hoursUntil = (checkIn.getTime() - now.getTime()) / 3_600_000
    if (hoursUntil < 72) return { error: "Free cancellation window has passed. Please contact the hotel." }

    await sql`UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = ${b.id}`
    await sql`INSERT INTO notifications (audience, title, body, type) VALUES ('admin', ${`Booking cancelled ${reference}`}, ${`Guest cancelled ${reference}`}, 'booking')`
  } catch (e) {
    console.error("[account] cancelBooking:", (e as Error).message)
    return { error: "Could not cancel the booking." }
  }
  revalidatePath("/account/bookings")
  return { success: "Your booking has been cancelled." }
}
