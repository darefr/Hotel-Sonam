import "server-only"
import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST || "smtp.gmail.com"
const port = Number(process.env.SMTP_PORT || 465)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.SMTP_FROM || user

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!user || !pass) {
    console.warn("[email] SMTP credentials missing; emails will be skipped.")
    return null
  }
  if (!transporter) {
    // Cast to satisfy the @types/nodemailer overload (types trail the v9 runtime).
    const options = {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      // Fail fast instead of hanging the serverless function. Without these,
      // a slow/blocked SMTP handshake on Vercel keeps the whole request open
      // until the platform times out (surfacing as "A server error occurred").
      connectionTimeout: 10_000,
      greetingTimeout: 8_000,
      socketTimeout: 12_000,
      pool: false,
    } as nodemailer.TransportOptions
    transporter = nodemailer.createTransport(options)
  }
  return transporter
}

// Hard ceiling so a stuck TLS/SMTP handshake can never block an auth flow.
const SEND_TIMEOUT_MS = 12_000

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const t = getTransporter()
  if (!t) return { skipped: true }
  try {
    const send = t.sendMail({
      from: `"Hotel Tukuche Peak" <${from}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP send timed out")), SEND_TIMEOUT_MS),
    )
    await Promise.race([send, timeout])
    return { ok: true }
  } catch (e) {
    // Never leak SMTP internals to the client; log a safe message only.
    console.error("[email] send failed:", (e as Error).message)
    return { ok: false }
  }
}

// ---------------- Branded HTML template ----------------

const BRAND = "#2f5d50" // deep pine
const BRAND_SOFT = "#eef3f0"
const INK = "#1c211f"

function shell(title: string, inner: string) {
  return `
  <div style="margin:0;padding:0;background:#f4f2ec;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${BRAND};border-radius:20px 20px 0 0;padding:28px 32px;color:#fff;">
        <div style="font-size:20px;font-weight:700;letter-spacing:0.5px;">Hotel Tukuche Peak</div>
        <div style="font-size:12px;opacity:0.85;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Tukuche &middot; Mustang, Nepal</div>
      </div>
      <div style="background:#ffffff;padding:32px;color:${INK};line-height:1.6;">
        <h1 style="margin:0 0 16px;font-size:22px;color:${INK};">${title}</h1>
        ${inner}
      </div>
      <div style="background:${BRAND_SOFT};border-radius:0 0 20px 20px;padding:20px 32px;color:#54605b;font-size:12px;">
        <p style="margin:0 0 6px;">Hotel Tukuche Peak, Tukuche, Mustang, Nepal</p>
        <p style="margin:0;">This is an automated message. Please do not reply with sensitive information.</p>
      </div>
    </div>
  </div>`
}

function codeBox(code: string) {
  return `<div style="margin:24px 0;text-align:center;">
    <div style="display:inline-block;background:${BRAND_SOFT};border:1px solid #d7e0db;border-radius:14px;padding:18px 28px;font-size:34px;font-weight:700;letter-spacing:10px;color:${BRAND};">${code}</div>
  </div>`
}

export function verificationEmail(name: string, code: string) {
  return shell(
    "Verify your account",
    `<p>Welcome to Hotel Tukuche Peak${name ? `, ${name}` : ""}. Use the verification code below to confirm your email address and activate your account.</p>
     ${codeBox(code)}
     <p style="color:#54605b;font-size:14px;">This code expires in 10 minutes. If you did not create an account, you can safely ignore this email.</p>`,
  )
}

export function resetEmail(name: string, code: string) {
  return shell(
    "Reset your password",
    `<p>Hi${name ? ` ${name}` : ""}, we received a request to reset your password. Enter the code below to continue.</p>
     ${codeBox(code)}
     <p style="color:#54605b;font-size:14px;">This code expires in 10 minutes. If you did not request a reset, please secure your account and ignore this email.</p>`,
  )
}

type BookingEmailData = {
  reference: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  total: number | string
  paymentStatus: string
  status: string
  specialRequests?: string | null
}

function bookingCard(b: BookingEmailData) {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 0;color:#54605b;font-size:14px;">${label}</td>
      <td style="padding:8px 0;color:${INK};font-size:14px;font-weight:600;text-align:right;">${value}</td>
    </tr>`
  return `<div style="border:1px solid #e2e8e4;border-radius:16px;padding:20px;margin:20px 0;background:#fbfcfb;">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND};margin-bottom:6px;">Booking Reference</div>
    <div style="font-size:22px;font-weight:700;color:${INK};margin-bottom:16px;">${b.reference}</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Guest", b.guestName)}
      ${row("Email", b.guestEmail)}
      ${b.guestPhone ? row("Phone", b.guestPhone) : ""}
      ${row("Room", b.roomName)}
      ${row("Check-in", b.checkIn)}
      ${row("Check-out", b.checkOut)}
      ${row("Guests", String(b.guests))}
      ${row("Total", `$${b.total}`)}
      ${row("Payment", b.paymentStatus)}
      ${row("Status", b.status)}
      ${b.specialRequests ? row("Requests", b.specialRequests) : ""}
    </table>
  </div>`
}

export function bookingConfirmationEmail(b: BookingEmailData) {
  return shell(
    "Your booking is confirmed",
    `<p>Thank you for choosing Hotel Tukuche Peak. We are delighted to welcome you to the heart of the Himalayas. Here are your reservation details:</p>
     ${bookingCard(b)}
     <p style="color:#54605b;font-size:14px;">We look forward to hosting you. For any changes, contact us and quote your booking reference.</p>`,
  )
}

export function ownerBookingEmail(b: BookingEmailData) {
  return shell(
    `New booking — ${b.reference}`,
    `<p>A new reservation has been received. Details below:</p>
     ${bookingCard(b)}`,
  )
}

export function contactNotificationEmail(m: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  return shell(
    "New contact message",
    `<table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#54605b;">Name</td><td style="padding:8px 0;text-align:right;font-weight:600;">${m.name}</td></tr>
      <tr><td style="padding:8px 0;color:#54605b;">Email</td><td style="padding:8px 0;text-align:right;font-weight:600;">${m.email}</td></tr>
      ${m.phone ? `<tr><td style="padding:8px 0;color:#54605b;">Phone</td><td style="padding:8px 0;text-align:right;font-weight:600;">${m.phone}</td></tr>` : ""}
      ${m.subject ? `<tr><td style="padding:8px 0;color:#54605b;">Subject</td><td style="padding:8px 0;text-align:right;font-weight:600;">${m.subject}</td></tr>` : ""}
    </table>
    <p style="margin-top:16px;padding:16px;background:${BRAND_SOFT};border-radius:12px;">${m.message}</p>`,
  )
}
