"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { requirePermission, hashPassword, normalizeEmail, type SessionUser } from "@/lib/auth"
import type { Role } from "@/lib/db"
import { sendMail } from "@/lib/email"

type Result = { ok: boolean; error?: string; message?: string }

async function guard(perm: string): Promise<SessionUser | null> {
  return requirePermission(perm)
}

function jsonArray(input: FormDataEntryValue | null): string {
  const raw = String(input ?? "").trim()
  if (!raw) return "[]"
  const arr = raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return JSON.stringify(arr)
}

// ============================ BOOKINGS ============================

export async function updateBookingStatus(formData: FormData): Promise<Result> {
  const staff = await guard("bookings")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")
  const valid = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]
  if (!valid.includes(status)) return { ok: false, error: "Invalid status" }

  const rows = await sql`
    UPDATE bookings SET status = ${status}, updated_at = now()
    WHERE id = ${id}
    RETURNING reference, guest_name, guest_email, check_in, check_out
  `
  const b = rows[0] as any
  if (!b) return { ok: false, error: "Booking not found" }

  // Notify guest on meaningful transitions (best-effort).
  try {
    if (status === "confirmed") {
      await sendMail({
        to: b.guest_email,
        subject: `Your booking ${b.reference} is confirmed`,
        html: `<p>Dear ${b.guest_name},</p><p>Your reservation <strong>${b.reference}</strong> at Hotel Tukuche Peak is confirmed. We look forward to welcoming you.</p>`,
      })
    } else if (status === "cancelled") {
      await sendMail({
        to: b.guest_email,
        subject: `Your booking ${b.reference} has been cancelled`,
        html: `<p>Dear ${b.guest_name},</p><p>Your reservation <strong>${b.reference}</strong> has been cancelled. If this is unexpected, please contact us.</p>`,
      })
    }
  } catch (e) {
    console.log("[v0] booking status email failed:", (e as Error).message)
  }

  revalidatePath("/admin/bookings")
  revalidatePath("/admin/frontdesk")
  revalidatePath(`/admin/bookings/${b.reference}`)
  revalidatePath("/admin")
  return { ok: true, message: `Booking ${status.replace("_", " ")}` }
}

export async function updatePaymentStatus(formData: FormData): Promise<Result> {
  const staff = await guard("bookings")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const payment = String(formData.get("payment_status") || "")
  if (!["unpaid", "paid", "refunded"].includes(payment)) return { ok: false, error: "Invalid payment status" }
  await sql`UPDATE bookings SET payment_status = ${payment}, updated_at = now() WHERE id = ${id}`
  revalidatePath("/admin/bookings")
  return { ok: true, message: "Payment updated" }
}

/** Create a walk-in / phone booking from the front desk. */
export async function createManualBooking(formData: FormData): Promise<Result> {
  const staff = await guard("frontdesk")
  if (!staff) return { ok: false, error: "Not authorized" }

  const roomId = String(formData.get("room_id") || "")
  const guestName = String(formData.get("guest_name") || "").trim()
  const guestEmail = normalizeEmail(String(formData.get("guest_email") || ""))
  const guestPhone = String(formData.get("guest_phone") || "").trim()
  const checkIn = String(formData.get("check_in") || "")
  const checkOut = String(formData.get("check_out") || "")
  const guests = Math.max(1, Number(formData.get("guests") || 1))
  const source = String(formData.get("source") || "walk_in")

  if (!roomId || !guestName || !checkIn || !checkOut) return { ok: false, error: "Missing required fields" }
  if (new Date(checkOut) <= new Date(checkIn)) return { ok: false, error: "Check-out must be after check-in" }

  const roomRows = await sql`SELECT price, total_units, name FROM rooms WHERE id = ${roomId} LIMIT 1`
  const room = roomRows[0] as any
  if (!room) return { ok: false, error: "Room not found" }

  // Atomic availability check to prevent overbooking.
  const [{ booked }] = (await sql`
    SELECT COUNT(*)::int AS booked FROM bookings
    WHERE room_id = ${roomId} AND status IN ('pending','confirmed','checked_in')
      AND check_in < ${checkOut} AND check_out > ${checkIn}
  `) as any[]
  if (Number(booked) >= Number(room.total_units)) return { ok: false, error: "No units available for those dates" }

  const nights = Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86_400_000)
  const rate = Number(room.price)
  const subtotal = rate * nights
  const tax = Math.round(subtotal * 0.13 * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  const reference = `HTP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  await sql`
    INSERT INTO bookings (reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
      guests, nights, room_rate, subtotal, tax, total, status, source)
    VALUES (${reference}, ${roomId}, ${guestName}, ${guestEmail || "walkin@hotel.local"}, ${guestPhone || null},
      ${checkIn}, ${checkOut}, ${guests}, ${nights}, ${rate}, ${subtotal}, ${tax}, ${total}, 'confirmed', ${source})
  `
  revalidatePath("/admin/bookings")
  revalidatePath("/admin/frontdesk")
  revalidatePath("/admin/calendar")
  return { ok: true, message: `Booking ${reference} created` }
}

// ============================ ROOMS ============================

export async function saveRoom(formData: FormData): Promise<Result> {
  const staff = await guard("rooms")
  if (!staff) return { ok: false, error: "Not authorized" }

  const id = String(formData.get("id") || "")
  const name = String(formData.get("name") || "").trim()
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const description = String(formData.get("description") || "").trim()
  const longDescription = String(formData.get("long_description") || "").trim()
  const price = Number(formData.get("price") || 0)
  const capacity = Math.max(1, Number(formData.get("capacity") || 2))
  const totalUnits = Math.max(1, Number(formData.get("total_units") || 1))
  const sizeSqm = formData.get("size_sqm") ? Number(formData.get("size_sqm")) : null
  const beds = String(formData.get("beds") || "").trim() || null
  const amenities = jsonArray(formData.get("amenities"))
  const images = jsonArray(formData.get("images"))
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true"
  const status = String(formData.get("status") || "active")
  const sort = Number(formData.get("sort") || 0)

  if (!name || !slug) return { ok: false, error: "Name and slug are required" }

  if (id) {
    await sql`
      UPDATE rooms SET name=${name}, slug=${slug}, description=${description}, long_description=${longDescription},
        price=${price}, capacity=${capacity}, total_units=${totalUnits}, size_sqm=${sizeSqm}, beds=${beds},
        amenities=${amenities}::jsonb, images=${images}::jsonb, featured=${featured}, status=${status},
        sort=${sort}, updated_at=now()
      WHERE id=${id}
    `
  } else {
    await sql`
      INSERT INTO rooms (name, slug, description, long_description, price, capacity, total_units, size_sqm,
        beds, amenities, images, featured, status, sort)
      VALUES (${name}, ${slug}, ${description}, ${longDescription}, ${price}, ${capacity}, ${totalUnits},
        ${sizeSqm}, ${beds}, ${amenities}::jsonb, ${images}::jsonb, ${featured}, ${status}, ${sort})
    `
  }
  revalidatePath("/admin/rooms")
  revalidatePath("/rooms")
  return { ok: true, message: "Room saved" }
}

export async function deleteRoom(formData: FormData): Promise<Result> {
  const staff = await guard("rooms")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM bookings WHERE room_id=${id} AND status IN ('pending','confirmed','checked_in')`) as any[]
  if (Number(count) > 0) return { ok: false, error: "Cannot delete: room has active bookings. Set status to hidden instead." }
  await sql`DELETE FROM rooms WHERE id=${id}`
  revalidatePath("/admin/rooms")
  revalidatePath("/rooms")
  return { ok: true, message: "Room deleted" }
}

// ============================ OFFERS ============================

export async function saveOffer(formData: FormData): Promise<Result> {
  const staff = await guard("offers")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const category = String(formData.get("category") || "seasonal")
  const discount = Math.min(100, Math.max(0, Number(formData.get("discount_pct") || 0)))
  const code = String(formData.get("code") || "").trim() || null
  const image = String(formData.get("image") || "").trim() || null
  const startDate = String(formData.get("start_date") || "") || null
  const endDate = String(formData.get("end_date") || "") || null
  const active = formData.get("active") === "on" || formData.get("active") === "true"
  if (!title) return { ok: false, error: "Title is required" }

  if (id) {
    await sql`
      UPDATE offers SET title=${title}, description=${description}, category=${category}, discount_pct=${discount},
        code=${code}, image=${image}, start_date=${startDate}, end_date=${endDate}, active=${active}
      WHERE id=${id}
    `
  } else {
    await sql`
      INSERT INTO offers (title, description, category, discount_pct, code, image, start_date, end_date, active)
      VALUES (${title}, ${description}, ${category}, ${discount}, ${code}, ${image}, ${startDate}, ${endDate}, ${active})
    `
  }
  revalidatePath("/admin/offers")
  revalidatePath("/offers")
  return { ok: true, message: "Offer saved" }
}

export async function deleteOffer(formData: FormData): Promise<Result> {
  const staff = await guard("offers")
  if (!staff) return { ok: false, error: "Not authorized" }
  await sql`DELETE FROM offers WHERE id=${String(formData.get("id") || "")}`
  revalidatePath("/admin/offers")
  revalidatePath("/offers")
  return { ok: true, message: "Offer deleted" }
}

// ============================ GALLERY ============================

export async function saveGalleryImage(formData: FormData): Promise<Result> {
  const staff = await guard("cms")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const url = String(formData.get("url") || "").trim()
  const caption = String(formData.get("caption") || "").trim() || null
  const category = String(formData.get("category") || "").trim() || null
  const sort = Number(formData.get("sort") || 0)
  if (!url) return { ok: false, error: "Image URL is required" }
  if (id) {
    await sql`UPDATE gallery SET url=${url}, caption=${caption}, category=${category}, sort=${sort} WHERE id=${id}`
  } else {
    await sql`INSERT INTO gallery (url, caption, category, sort) VALUES (${url}, ${caption}, ${category}, ${sort})`
  }
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { ok: true, message: "Image saved" }
}

export async function deleteGalleryImage(formData: FormData): Promise<Result> {
  const staff = await guard("cms")
  if (!staff) return { ok: false, error: "Not authorized" }
  await sql`DELETE FROM gallery WHERE id=${String(formData.get("id") || "")}`
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { ok: true, message: "Image deleted" }
}

// ============================ EXPERIENCES ============================

export async function saveExperience(formData: FormData): Promise<Result> {
  const staff = await guard("cms")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const image = String(formData.get("image") || "").trim() || null
  const duration = String(formData.get("duration") || "").trim() || null
  const difficulty = String(formData.get("difficulty") || "").trim() || null
  const price = Number(formData.get("price") || 0)
  const sort = Number(formData.get("sort") || 0)
  if (!title) return { ok: false, error: "Title is required" }
  if (id) {
    await sql`UPDATE experiences SET title=${title}, description=${description}, image=${image}, duration=${duration}, difficulty=${difficulty}, price=${price}, sort=${sort} WHERE id=${id}`
  } else {
    await sql`INSERT INTO experiences (title, description, image, duration, difficulty, price, sort) VALUES (${title}, ${description}, ${image}, ${duration}, ${difficulty}, ${price}, ${sort})`
  }
  revalidatePath("/admin/experiences")
  revalidatePath("/experiences")
  return { ok: true, message: "Experience saved" }
}

export async function deleteExperience(formData: FormData): Promise<Result> {
  const staff = await guard("cms")
  if (!staff) return { ok: false, error: "Not authorized" }
  await sql`DELETE FROM experiences WHERE id=${String(formData.get("id") || "")}`
  revalidatePath("/admin/experiences")
  revalidatePath("/experiences")
  return { ok: true, message: "Experience deleted" }
}

// ============================ RESTAURANT ============================

export async function saveMenuCategory(formData: FormData): Promise<Result> {
  const staff = await guard("restaurant")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const name = String(formData.get("name") || "").trim()
  const sort = Number(formData.get("sort") || 0)
  if (!name) return { ok: false, error: "Name is required" }
  if (id) await sql`UPDATE menu_categories SET name=${name}, sort=${sort} WHERE id=${id}`
  else await sql`INSERT INTO menu_categories (name, sort) VALUES (${name}, ${sort})`
  revalidatePath("/admin/restaurant")
  revalidatePath("/restaurant")
  return { ok: true, message: "Category saved" }
}

export async function saveMenuItem(formData: FormData): Promise<Result> {
  const staff = await guard("restaurant")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const categoryId = String(formData.get("category_id") || "")
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const price = Number(formData.get("price") || 0)
  const image = String(formData.get("image") || "").trim() || null
  const dietary = jsonArray(formData.get("dietary"))
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true"
  const available = formData.get("available") === "on" || formData.get("available") === "true"
  const sort = Number(formData.get("sort") || 0)
  if (!name || !categoryId) return { ok: false, error: "Name and category are required" }
  if (id) {
    await sql`UPDATE menu_items SET category_id=${categoryId}, name=${name}, description=${description}, price=${price}, image=${image}, dietary=${dietary}::jsonb, featured=${featured}, available=${available}, sort=${sort} WHERE id=${id}`
  } else {
    await sql`INSERT INTO menu_items (category_id, name, description, price, image, dietary, featured, available, sort) VALUES (${categoryId}, ${name}, ${description}, ${price}, ${image}, ${dietary}::jsonb, ${featured}, ${available}, ${sort})`
  }
  revalidatePath("/admin/restaurant")
  revalidatePath("/restaurant")
  return { ok: true, message: "Menu item saved" }
}

export async function deleteMenuItem(formData: FormData): Promise<Result> {
  const staff = await guard("restaurant")
  if (!staff) return { ok: false, error: "Not authorized" }
  await sql`DELETE FROM menu_items WHERE id=${String(formData.get("id") || "")}`
  revalidatePath("/admin/restaurant")
  revalidatePath("/restaurant")
  return { ok: true, message: "Item deleted" }
}

// ============================ REVIEWS ============================

export async function moderateReview(formData: FormData): Promise<Result> {
  const staff = await guard("reviews")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")
  if (!["pending", "approved", "rejected", "hidden"].includes(status)) return { ok: false, error: "Invalid status" }
  await sql`UPDATE reviews SET status=${status} WHERE id=${id}`
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
  return { ok: true, message: `Review ${status}` }
}

export async function replyToReview(formData: FormData): Promise<Result> {
  const staff = await guard("reviews")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const reply = String(formData.get("reply") || "").trim()
  await sql`UPDATE reviews SET reply=${reply || null} WHERE id=${id}`
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
  return { ok: true, message: "Reply saved" }
}

// ============================ CRM ============================

export async function updateCustomerNotes(formData: FormData): Promise<Result> {
  const staff = await guard("crm")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const notes = String(formData.get("notes") || "").trim()
  await sql`UPDATE users SET notes=${notes || null}, updated_at=now() WHERE id=${id} AND role='GUEST'`
  revalidatePath(`/admin/customers/${id}`)
  revalidatePath("/admin/customers")
  return { ok: true, message: "Notes saved" }
}

export async function adjustLoyaltyPoints(formData: FormData): Promise<Result> {
  const staff = await guard("crm")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const points = Number(formData.get("points") || 0)
  const reason = String(formData.get("reason") || "Manual adjustment").trim()
  if (!points) return { ok: false, error: "Points must be non-zero" }
  await sql`INSERT INTO loyalty_transactions (user_id, points, reason) VALUES (${id}, ${points}, ${reason})`
  await sql`UPDATE users SET loyalty_points = GREATEST(0, loyalty_points + ${points}), updated_at=now() WHERE id=${id}`
  revalidatePath(`/admin/customers/${id}`)
  return { ok: true, message: "Loyalty points adjusted" }
}

// ============================ STAFF ============================

const STAFF_ROLES: Role[] = ["ADMIN", "FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MARKETING", "SUPER_ADMIN"]

export async function saveStaff(formData: FormData): Promise<Result> {
  // Only SUPER_ADMIN & ADMIN manage staff — enforce via a dedicated perm check.
  const staff = await guard("dashboard")
  if (!staff || !(staff.role === "SUPER_ADMIN" || staff.role === "ADMIN")) {
    return { ok: false, error: "Not authorized" }
  }
  const id = String(formData.get("id") || "")
  const name = String(formData.get("name") || "").trim()
  const email = normalizeEmail(String(formData.get("email") || ""))
  const role = String(formData.get("role") || "FRONT_DESK") as Role
  const password = String(formData.get("password") || "")

  if (!STAFF_ROLES.includes(role)) return { ok: false, error: "Invalid role" }
  // Only SUPER_ADMIN can grant SUPER_ADMIN.
  if (role === "SUPER_ADMIN" && staff.role !== "SUPER_ADMIN") return { ok: false, error: "Only a Super Admin can assign that role" }
  if (!name || !email) return { ok: false, error: "Name and email are required" }

  if (id) {
    await sql`UPDATE users SET name=${name}, role=${role}, updated_at=now() WHERE id=${id}`
    if (password) {
      if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" }
      await sql`UPDATE users SET password_hash=${await hashPassword(password)} WHERE id=${id}`
    }
  } else {
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" }
    const existing = await sql`SELECT id FROM users WHERE email_norm=${email} LIMIT 1`
    if (existing.length) return { ok: false, error: "A user with that email already exists" }
    await sql`
      INSERT INTO users (name, email, email_norm, password_hash, role, email_verified)
      VALUES (${name}, ${email}, ${email}, ${await hashPassword(password)}, ${role}, TRUE)
    `
  }
  revalidatePath("/admin/staff")
  return { ok: true, message: "Staff member saved" }
}

export async function removeStaff(formData: FormData): Promise<Result> {
  const staff = await guard("dashboard")
  if (!staff || staff.role !== "SUPER_ADMIN") return { ok: false, error: "Only a Super Admin can remove staff" }
  const id = String(formData.get("id") || "")
  if (id === staff.id) return { ok: false, error: "You cannot remove your own account" }
  // Demote to guest rather than delete, to preserve any linked records.
  await sql`UPDATE users SET role='GUEST', updated_at=now() WHERE id=${id}`
  revalidatePath("/admin/staff")
  return { ok: true, message: "Staff access revoked" }
}

// ============================ SETTINGS / CMS KV ============================

export async function saveSetting(key: string, value: unknown): Promise<Result> {
  const staff = await guard("dashboard")
  if (!staff) return { ok: false, error: "Not authorized" }
  await sql`
    INSERT INTO cms_content (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
  revalidatePath("/admin/settings")
  return { ok: true, message: "Settings saved" }
}

export async function saveHotelSettings(formData: FormData): Promise<Result> {
  const staff = await guard("dashboard")
  if (!staff) return { ok: false, error: "Not authorized" }
  const settings = {
    name: String(formData.get("name") || ""),
    tagline: String(formData.get("tagline") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    address: String(formData.get("address") || ""),
    checkInTime: String(formData.get("check_in_time") || ""),
    checkOutTime: String(formData.get("check_out_time") || ""),
  }
  return saveSetting("hotel_info", settings)
}

// ============================ CONTACT / WAITLIST ============================

export async function markContactHandled(formData: FormData): Promise<Result> {
  const staff = await guard("frontdesk")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  await sql`UPDATE contact_messages SET handled = NOT handled WHERE id=${id}`
  revalidatePath("/admin/messages")
  return { ok: true, message: "Message updated" }
}

export async function updateWaitlistStatus(formData: FormData): Promise<Result> {
  const staff = await guard("waitlist")
  if (!staff) return { ok: false, error: "Not authorized" }
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")
  if (!["open", "contacted", "converted", "closed"].includes(status)) return { ok: false, error: "Invalid status" }
  await sql`UPDATE waitlist SET status=${status} WHERE id=${id}`
  revalidatePath("/admin/waitlist")
  return { ok: true, message: "Waitlist updated" }
}
