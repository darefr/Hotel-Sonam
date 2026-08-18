import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { sql, type Role } from "./db"

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-insecure-secret-change-me")
const COOKIE = "htp_session"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  emailVerified: boolean
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10)
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash)
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET)

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
      emailVerified: payload.emailVerified as boolean,
    }
  } catch {
    return null
  }
}

/** Fetches a fresh user from DB by session; returns null if session invalid or user missing. */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const rows = await sql`
    SELECT id, name, email, phone, whatsapp, role, email_verified, loyalty_points,
           loyalty_tier, preferences, notes, created_at
    FROM users WHERE id = ${session.id} LIMIT 1
  `
  return rows[0] ?? null
}

const STAFF: Role[] = ["SUPER_ADMIN", "ADMIN", "FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MARKETING"]

export function isStaff(role?: Role | null) {
  return !!role && STAFF.includes(role)
}

// Role -> permission matrix (server-enforced).
export const PERMISSIONS: Record<Role, string[]> = {
  GUEST: [],
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "dashboard",
    "frontdesk",
    "bookings",
    "calendar",
    "rooms",
    "restaurant",
    "cms",
    "offers",
    "reviews",
    "crm",
    "loyalty",
    "waitlist",
    "reports",
    "notifications",
  ],
  FRONT_DESK: ["dashboard", "frontdesk", "bookings", "calendar", "crm", "waitlist", "notifications"],
  HOUSEKEEPING: ["dashboard", "frontdesk", "calendar", "rooms"],
  RESTAURANT: ["dashboard", "restaurant"],
  MARKETING: ["dashboard", "cms", "offers", "reviews", "gallery", "reports"],
}

export function can(role: Role | null | undefined, perm: string) {
  if (!role) return false
  const perms = PERMISSIONS[role]
  if (!perms) return false
  return perms.includes("*") || perms.includes(perm)
}

/** All permissions a role holds, expanded (SUPER_ADMIN gets every known perm). */
const ALL_PERMS = Array.from(new Set(Object.values(PERMISSIONS).flat().filter((p) => p !== "*")))
export function permsFor(role: Role | null | undefined): string[] {
  if (!role) return []
  const perms = PERMISSIONS[role] ?? []
  return perms.includes("*") ? ALL_PERMS : perms
}

/** Server guard for admin pages: returns the staff session or throws a redirect signal. */
export async function requireStaff() {
  const session = await getSession()
  if (!session || !isStaff(session.role)) return null
  return session
}

/** Server guard: staff session that also holds `perm`, else null. */
export async function requirePermission(perm: string) {
  const session = await getSession()
  if (!session || !isStaff(session.role) || !can(session.role, perm)) return null
  return session
}

export function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function bookingReference() {
  const y = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `HTP-${y}-${rand}`
}
