"use server"

import { sql } from "@/lib/db"
import { contactSchema } from "@/lib/validation"
import { sendMail, contactNotificationEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

export type ContactState = { ok?: boolean; error?: string }

const OWNER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "hotelsonam@gmail.com"

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "anon"
  const rl = rateLimit(`contact:${ip}`, 5, 60_000)
  if (!rl.ok) return { error: "Too many messages. Please wait a moment and try again." }

  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  }
  const m = parsed.data

  try {
    await sql`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (${m.name}, ${m.email}, ${m.phone || null}, ${m.subject || null}, ${m.message})
    `
    // Notify the hotel and mirror to admin notifications. Email failures never block the guest.
    await Promise.allSettled([
      sendMail({
        to: OWNER_EMAIL,
        subject: `New enquiry: ${m.subject || "Website contact"}`,
        html: contactNotificationEmail(m),
      }),
      sql`
        INSERT INTO notifications (audience, title, body, type)
        VALUES ('admin', ${`New enquiry from ${m.name}`}, ${m.message.slice(0, 200)}, 'contact')
      `,
    ])
    return { ok: true }
  } catch (e) {
    console.error("[contact] failed:", (e as Error).message)
    return { error: "Something went wrong sending your message. Please try WhatsApp or email us directly." }
  }
}
