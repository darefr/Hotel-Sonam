"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { sql } from "@/lib/db"
import {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  generateCode,
  type SessionUser,
} from "@/lib/auth"
import {
  signupSchema,
  loginSchema,
  verifyCodeSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "@/lib/validation"
import { sendMail, verificationEmail, resetEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

export type AuthState = { error?: string; ok?: boolean; info?: string }

const CODE_TTL_MIN = 10

async function clientIp() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0] ?? "anon"
}

async function issueCode(emailNorm: string, purpose: "verify" | "reset") {
  const code = generateCode()
  const expires = new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString()
  // Invalidate previous unconsumed codes of the same purpose, then insert a fresh one.
  await sql`UPDATE auth_codes SET consumed = TRUE WHERE email_norm = ${emailNorm} AND purpose = ${purpose} AND consumed = FALSE`
  await sql`
    INSERT INTO auth_codes (email_norm, code, purpose, expires_at)
    VALUES (${emailNorm}, ${code}, ${purpose}, ${expires})
  `
  return code
}

// ------------------------------- SIGNUP -------------------------------
export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`signup:${ip}`, 5, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." }

  const { name, email, phone, password } = parsed.data
  const emailNorm = normalizeEmail(email)

  // All DB/email work is wrapped so a transient failure returns a friendly
  // message instead of crashing into Next's "A server error occurred." page.
  // redirect() must stay OUTSIDE the try (it throws NEXT_REDIRECT by design).
  let redirectTo: string | null = null
  try {
    const existing = await sql`SELECT id, email_verified FROM users WHERE email_norm = ${emailNorm} LIMIT 1`
    if (existing.length > 0) {
      if (!existing[0].email_verified) {
        const code = await issueCode(emailNorm, "verify")
        await sendMail({ to: email, subject: "Verify your account", html: verificationEmail(name, code) })
        redirectTo = `/verify?email=${encodeURIComponent(emailNorm)}`
      } else {
        return { error: "An account with this email already exists. Please sign in." }
      }
    } else {
      const hash = await hashPassword(password)
      await sql`
        INSERT INTO users (name, email, email_norm, phone, password_hash, role, email_verified)
        VALUES (${name}, ${email}, ${emailNorm}, ${phone || null}, ${hash}, 'GUEST', FALSE)
      `
      const code = await issueCode(emailNorm, "verify")
      await sendMail({ to: email, subject: "Verify your account", html: verificationEmail(name, code) })
      redirectTo = `/verify?email=${encodeURIComponent(emailNorm)}`
    }
  } catch (e) {
    console.error("[auth] signup failed:", (e as Error).message)
    return { error: "We couldn't create your account right now. Please try again in a moment." }
  }

  if (redirectTo) redirect(redirectTo)
  return {}
}

// ------------------------------- VERIFY -------------------------------
export async function verifyAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`verify:${ip}`, 10, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = verifyCodeSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    code: String(formData.get("code") ?? ""),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter the 6-digit code." }
  const emailNorm = normalizeEmail(parsed.data.email)

  try {
    const rows = await sql`
      SELECT id, code, expires_at, consumed, attempts FROM auth_codes
      WHERE email_norm = ${emailNorm} AND purpose = 'verify' AND consumed = FALSE
      ORDER BY created_at DESC LIMIT 1
    `
    const rec = rows[0]
    if (!rec) return { error: "No active code. Please request a new one." }
    if (new Date(rec.expires_at) < new Date()) return { error: "This code has expired. Please request a new one." }
    if (rec.attempts >= 5) return { error: "Too many incorrect attempts. Please request a new code." }
    if (rec.code !== parsed.data.code) {
      await sql`UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ${rec.id}`
      return { error: "Incorrect code. Please try again." }
    }

    await sql`UPDATE auth_codes SET consumed = TRUE WHERE id = ${rec.id}`
    const users = await sql`
      UPDATE users SET email_verified = TRUE, updated_at = now()
      WHERE email_norm = ${emailNorm}
      RETURNING id, name, email, role, email_verified
    `
    const u = users[0]
    if (!u) return { error: "Account not found." }
    await createSession({
      id: u.id, name: u.name, email: u.email, role: u.role, emailVerified: true,
    } as SessionUser)
  } catch (e) {
    console.error("[auth] verify failed:", (e as Error).message)
    return { error: "We couldn't verify your code right now. Please try again in a moment." }
  }

  redirect("/account")
}

export async function resendCodeAction(email: string, purpose: "verify" | "reset" = "verify"): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`resend:${ip}`, 3, 60_000).ok) return { error: "Please wait before requesting another code." }
  const emailNorm = normalizeEmail(email)
  try {
    const rows = await sql`SELECT name, email FROM users WHERE email_norm = ${emailNorm} LIMIT 1`
    if (rows.length === 0) return { ok: true, info: "If the account exists, a new code has been sent." }
    const code = await issueCode(emailNorm, purpose)
    const html = purpose === "verify" ? verificationEmail(rows[0].name, code) : resetEmail(rows[0].name, code)
    await sendMail({ to: rows[0].email, subject: purpose === "verify" ? "Verify your account" : "Reset your password", html })
    return { ok: true, info: "A new code is on its way." }
  } catch (e) {
    console.error("[auth] resend failed:", (e as Error).message)
    return { error: "We couldn't send a new code right now. Please try again in a moment." }
  }
}

// ------------------------------- LOGIN -------------------------------
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  })
  if (!parsed.success) return { error: "Enter a valid email and password." }
  const emailNorm = normalizeEmail(parsed.data.email)
  const next = String(formData.get("next") ?? "") || "/account"

  let redirectTo: string | null = null
  try {
    const rows = await sql`
      SELECT id, name, email, role, password_hash, email_verified FROM users WHERE email_norm = ${emailNorm} LIMIT 1
    `
    const u = rows[0]
    if (!u || !(await verifyPassword(parsed.data.password, u.password_hash))) {
      return { error: "Incorrect email or password." }
    }
    if (!u.email_verified) {
      const code = await issueCode(emailNorm, "verify")
      await sendMail({ to: u.email, subject: "Verify your account", html: verificationEmail(u.name, code) })
      redirectTo = `/verify?email=${encodeURIComponent(emailNorm)}`
    } else {
      await createSession({
        id: u.id, name: u.name, email: u.email, role: u.role, emailVerified: true,
      } as SessionUser)
      // Staff land in the PMS; guests in their portal (unless a safe next path was provided).
      const staff = ["SUPER_ADMIN", "ADMIN", "FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MARKETING"]
      redirectTo = staff.includes(u.role) ? "/admin" : next.startsWith("/") ? next : "/account"
    }
  } catch (e) {
    console.error("[auth] login failed:", (e as Error).message)
    return { error: "We couldn't sign you in right now. Please try again in a moment." }
  }

  if (redirectTo) redirect(redirectTo)
  return {}
}

// --------------------------- ADMIN / STAFF LOGIN ---------------------------
const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MARKETING"]

export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`admin-login:${ip}`, 10, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  })
  if (!parsed.success) return { error: "Enter a valid email and password." }
  const emailNorm = normalizeEmail(parsed.data.email)

  try {
    const rows = await sql`
      SELECT id, name, email, role, password_hash, email_verified FROM users WHERE email_norm = ${emailNorm} LIMIT 1
    `
    const u = rows[0]
    // Constant-ish response: same error whether the user is missing, wrong password, or not staff.
    if (!u || !(await verifyPassword(parsed.data.password, u.password_hash)) || !STAFF_ROLES.includes(u.role)) {
      return { error: "Invalid staff credentials." }
    }

    await createSession({
      id: u.id, name: u.name, email: u.email, role: u.role, emailVerified: true,
    } as SessionUser)
  } catch (e) {
    console.error("[auth] admin login failed:", (e as Error).message)
    return { error: "We couldn't sign you in right now. Please try again in a moment." }
  }

  redirect("/admin")
}

// ------------------------------- LOGOUT -------------------------------
export async function logoutAction() {
  await destroySession()
  redirect("/")
}

// --------------------------- FORGOT PASSWORD --------------------------
export async function requestResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`reset-req:${ip}`, 5, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = requestResetSchema.safeParse({ email: String(formData.get("email") ?? "") })
  if (!parsed.success) return { error: "Enter a valid email." }
  const emailNorm = normalizeEmail(parsed.data.email)

  try {
    const rows = await sql`SELECT name, email FROM users WHERE email_norm = ${emailNorm} LIMIT 1`
    if (rows.length > 0) {
      const code = await issueCode(emailNorm, "reset")
      await sendMail({ to: rows[0].email, subject: "Reset your password", html: resetEmail(rows[0].name, code) })
    }
  } catch (e) {
    console.error("[auth] reset request failed:", (e as Error).message)
    return { error: "We couldn't process that request right now. Please try again in a moment." }
  }

  // Always redirect to reset step to avoid leaking which emails exist.
  redirect(`/reset-password?email=${encodeURIComponent(emailNorm)}`)
}

// ---------------------------- RESET PASSWORD --------------------------
export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp()
  if (!rateLimit(`reset:${ip}`, 10, 60_000).ok) return { error: "Too many attempts. Please wait a moment." }

  const parsed = resetPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    code: String(formData.get("code") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." }
  const emailNorm = normalizeEmail(parsed.data.email)

  try {
    const rows = await sql`
      SELECT id, code, expires_at, consumed, attempts FROM auth_codes
      WHERE email_norm = ${emailNorm} AND purpose = 'reset' AND consumed = FALSE
      ORDER BY created_at DESC LIMIT 1
    `
    const rec = rows[0]
    if (!rec) return { error: "No active reset code. Please request a new one." }
    if (new Date(rec.expires_at) < new Date()) return { error: "This code has expired. Please request a new one." }
    if (rec.attempts >= 5) return { error: "Too many incorrect attempts. Please request a new code." }
    if (rec.code !== parsed.data.code) {
      await sql`UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ${rec.id}`
      return { error: "Incorrect code. Please try again." }
    }

    const hash = await hashPassword(parsed.data.password)
    await sql`UPDATE auth_codes SET consumed = TRUE WHERE id = ${rec.id}`
    await sql`UPDATE users SET password_hash = ${hash}, email_verified = TRUE, updated_at = now() WHERE email_norm = ${emailNorm}`
  } catch (e) {
    console.error("[auth] reset password failed:", (e as Error).message)
    return { error: "We couldn't reset your password right now. Please try again in a moment." }
  }

  redirect("/login?reset=1")
}
