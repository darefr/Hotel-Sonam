import "server-only"
import { sql, safeRead } from "./db"

// ============================ DASHBOARD ANALYTICS ============================

export async function getDashboardStats() {
  return safeRead(
    async () => {
      const [revenue] = await sql`
        SELECT
          COALESCE(SUM(total) FILTER (WHERE status IN ('confirmed','checked_in','checked_out')), 0) AS total_revenue,
          COALESCE(SUM(total) FILTER (WHERE status IN ('confirmed','checked_in','checked_out') AND created_at >= date_trunc('month', now())), 0) AS month_revenue,
          COUNT(*) FILTER (WHERE status != 'cancelled') AS total_bookings,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
          COUNT(*) FILTER (WHERE check_in = CURRENT_DATE AND status IN ('confirmed','pending')) AS arrivals_today,
          COUNT(*) FILTER (WHERE check_out = CURRENT_DATE AND status = 'checked_in') AS departures_today,
          COUNT(*) FILTER (WHERE status = 'checked_in') AS in_house
        FROM bookings
      `
      const [guests] = await sql`SELECT COUNT(*) AS total_guests FROM users WHERE role = 'GUEST'`
      const [rooms] = await sql`SELECT COALESCE(SUM(total_units),0) AS total_units FROM rooms WHERE status = 'active'`
      const [reviews] = await sql`
        SELECT COALESCE(AVG(rating),0) AS avg_rating, COUNT(*) FILTER (WHERE status='pending') AS pending_reviews
        FROM reviews
      `
      // Occupancy tonight: room-nights sold vs available
      const [occ] = await sql`
        SELECT
          (SELECT COALESCE(SUM(total_units),0) FROM rooms WHERE status='active')::int AS units,
          (SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed','checked_in')
             AND check_in <= CURRENT_DATE AND check_out > CURRENT_DATE)::int AS occupied
      `
      const occupancy = occ.units > 0 ? Math.round((occ.occupied / occ.units) * 100) : 0
      return {
        totalRevenue: Number(revenue.total_revenue),
        monthRevenue: Number(revenue.month_revenue),
        totalBookings: Number(revenue.total_bookings),
        pendingBookings: Number(revenue.pending_bookings),
        arrivalsToday: Number(revenue.arrivals_today),
        departuresToday: Number(revenue.departures_today),
        inHouse: Number(revenue.in_house),
        totalGuests: Number(guests.total_guests),
        totalUnits: Number(rooms.total_units),
        avgRating: Number(reviews.avg_rating),
        pendingReviews: Number(reviews.pending_reviews),
        occupancy,
      }
    },
    {
      totalRevenue: 0, monthRevenue: 0, totalBookings: 0, pendingBookings: 0,
      arrivalsToday: 0, departuresToday: 0, inHouse: 0, totalGuests: 0,
      totalUnits: 0, avgRating: 0, pendingReviews: 0, occupancy: 0,
    },
  )
}

/** Revenue + booking counts for the last N months (oldest first). */
export async function getRevenueTrend(months = 6) {
  return safeRead(async () => {
    const rows = await sql`
      SELECT to_char(date_trunc('month', created_at), 'Mon') AS label,
             date_trunc('month', created_at) AS bucket,
             COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'),0) AS revenue,
             COUNT(*) FILTER (WHERE status != 'cancelled') AS bookings
      FROM bookings
      WHERE created_at >= date_trunc('month', now()) - (${months - 1} || ' months')::interval
      GROUP BY bucket
      ORDER BY bucket
    `
    return (rows as any[]).map((r) => ({
      label: r.label,
      revenue: Number(r.revenue),
      bookings: Number(r.bookings),
    }))
  }, [] as { label: string; revenue: number; bookings: number }[])
}

/** Occupancy % per day for the next N days. */
export async function getOccupancyForecast(days = 14) {
  return safeRead(async () => {
    const rows = await sql`
      WITH cal AS (
        SELECT generate_series(CURRENT_DATE, CURRENT_DATE + (${days - 1} || ' days')::interval, '1 day')::date AS day
      ),
      cap AS (SELECT COALESCE(SUM(total_units),0)::int AS units FROM rooms WHERE status='active')
      SELECT to_char(c.day, 'Mon DD') AS label, c.day,
        (SELECT COUNT(*) FROM bookings b
          WHERE b.status IN ('confirmed','checked_in','pending')
            AND b.check_in <= c.day AND b.check_out > c.day)::int AS occupied,
        cap.units
      FROM cal c, cap
      ORDER BY c.day
    `
    return (rows as any[]).map((r) => ({
      label: r.label,
      occupancy: r.units > 0 ? Math.round((Number(r.occupied) / Number(r.units)) * 100) : 0,
      occupied: Number(r.occupied),
      units: Number(r.units),
    }))
  }, [] as { label: string; occupancy: number; occupied: number; units: number }[])
}

/** Revenue share by room type. */
export async function getRevenueByRoom() {
  return safeRead(async () => {
    const rows = await sql`
      SELECT COALESCE(r.name, 'Unassigned') AS name,
             COALESCE(SUM(b.total) FILTER (WHERE b.status != 'cancelled'),0) AS revenue,
             COUNT(b.id) FILTER (WHERE b.status != 'cancelled') AS bookings
      FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      GROUP BY r.name ORDER BY revenue DESC
    `
    return (rows as any[]).map((r) => ({
      name: r.name, revenue: Number(r.revenue), bookings: Number(r.bookings),
    }))
  }, [] as { name: string; revenue: number; bookings: number }[])
}

// ============================ BOOKINGS ============================

export async function getBookings(opts: { status?: string; search?: string; limit?: number } = {}) {
  const { status = "all", search = "", limit = 200 } = opts
  return safeRead(async () => {
    const rows = await sql`
      SELECT b.*, r.name AS room_name, r.slug AS room_slug
      FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE (${status} = 'all' OR b.status = ${status})
        AND (${search} = '' OR b.guest_name ILIKE ${"%" + search + "%"}
             OR b.reference ILIKE ${"%" + search + "%"} OR b.guest_email ILIKE ${"%" + search + "%"})
      ORDER BY b.created_at DESC
      LIMIT ${limit}
    `
    return rows as any[]
  }, [] as any[])
}

export async function getBookingByRef(reference: string) {
  return safeRead(async () => {
    const rows = await sql`
      SELECT b.*, r.name AS room_name, r.slug AS room_slug, u.email AS account_email, u.loyalty_tier
      FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id LEFT JOIN users u ON u.id = b.user_id
      WHERE b.reference = ${reference} LIMIT 1
    `
    return (rows[0] as any) ?? null
  }, null)
}

/** Bookings overlapping a date window, for the calendar. */
export async function getCalendarBookings(from: string, to: string) {
  return safeRead(async () => {
    const rows = await sql`
      SELECT b.id, b.reference, b.guest_name, b.check_in, b.check_out, b.status, b.guests,
             r.name AS room_name, r.id AS room_id
      FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.status != 'cancelled' AND b.check_in < ${to} AND b.check_out > ${from}
      ORDER BY b.check_in
    `
    return rows as any[]
  }, [] as any[])
}

export async function getArrivalsDepartures() {
  return safeRead(async () => {
    const arrivals = await sql`
      SELECT b.*, r.name AS room_name FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.check_in = CURRENT_DATE AND b.status IN ('confirmed','pending') ORDER BY b.created_at
    `
    const departures = await sql`
      SELECT b.*, r.name AS room_name FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.check_out = CURRENT_DATE AND b.status = 'checked_in' ORDER BY b.created_at
    `
    const inHouse = await sql`
      SELECT b.*, r.name AS room_name FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.status = 'checked_in' ORDER BY b.check_out
    `
    return { arrivals: arrivals as any[], departures: departures as any[], inHouse: inHouse as any[] }
  }, { arrivals: [] as any[], departures: [] as any[], inHouse: [] as any[] })
}

// ============================ ROOMS ============================

export async function getAdminRooms() {
  return safeRead(async () => {
    const rows = await sql`
      SELECT r.*,
        (SELECT COUNT(*) FROM bookings b WHERE b.room_id = r.id AND b.status IN ('confirmed','checked_in')
           AND b.check_in <= CURRENT_DATE AND b.check_out > CURRENT_DATE)::int AS occupied_now
      FROM rooms r ORDER BY r.sort, r.name
    `
    return rows as any[]
  }, [] as any[])
}

export async function getRoomById(id: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT * FROM rooms WHERE id = ${id} LIMIT 1`
    return (rows[0] as any) ?? null
  }, null)
}

// ============================ CRM ============================

export async function getCustomers(search = "") {
  return safeRead(async () => {
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.phone, u.whatsapp, u.loyalty_points, u.loyalty_tier,
             u.created_at, u.notes,
             COUNT(b.id) FILTER (WHERE b.status != 'cancelled') AS bookings_count,
             COALESCE(SUM(b.total) FILTER (WHERE b.status IN ('confirmed','checked_in','checked_out')),0) AS lifetime_value,
             MAX(b.check_in) AS last_stay
      FROM users u LEFT JOIN bookings b ON b.user_id = u.id
      WHERE u.role = 'GUEST' AND (${search} = '' OR u.name ILIKE ${"%" + search + "%"} OR u.email ILIKE ${"%" + search + "%"})
      GROUP BY u.id ORDER BY lifetime_value DESC, u.created_at DESC
      LIMIT 300
    `
    return rows as any[]
  }, [] as any[])
}

export async function getCustomerById(id: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT * FROM users WHERE id = ${id} AND role = 'GUEST' LIMIT 1`
    const user = (rows[0] as any) ?? null
    if (!user) return null
    const bookings = await sql`
      SELECT b.*, r.name AS room_name FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.user_id = ${id} ORDER BY b.check_in DESC
    `
    return { user, bookings: bookings as any[] }
  }, null)
}

// ============================ RESTAURANT ============================

export async function getAdminMenu() {
  return safeRead(async () => {
    const cats = await sql`SELECT * FROM menu_categories ORDER BY sort, name`
    const items = await sql`SELECT * FROM menu_items ORDER BY sort, name`
    return (cats as any[]).map((c) => ({
      ...c,
      items: (items as any[]).filter((i) => i.category_id === c.id),
    }))
  }, [] as any[])
}

// ============================ CMS / GALLERY / OFFERS / EXPERIENCES ============================

export async function getAdminGallery() {
  return safeRead(async () => (await sql`SELECT * FROM gallery ORDER BY sort, id`) as any[], [] as any[])
}

export async function getAdminOffers() {
  return safeRead(async () => (await sql`SELECT * FROM offers ORDER BY created_at DESC`) as any[], [] as any[])
}

export async function getAdminExperiences() {
  return safeRead(async () => (await sql`SELECT * FROM experiences ORDER BY sort, title`) as any[], [] as any[])
}

// ============================ REVIEWS ============================

export async function getAdminReviews(status = "all") {
  return safeRead(async () => {
    const rows = await sql`
      SELECT rv.*, r.name AS room_name
      FROM reviews rv LEFT JOIN rooms r ON r.id = rv.room_id
      WHERE (${status} = 'all' OR rv.status = ${status})
      ORDER BY rv.created_at DESC
    `
    return rows as any[]
  }, [] as any[])
}

// ============================ STAFF ============================

export async function getStaff() {
  return safeRead(async () => {
    const rows = await sql`
      SELECT id, name, email, role, created_at FROM users
      WHERE role != 'GUEST' ORDER BY created_at
    `
    return rows as any[]
  }, [] as any[])
}

// ============================ SETTINGS / CMS KV ============================

export async function getSetting(key: string) {
  return safeRead(async () => {
    const rows = await sql`SELECT value FROM cms_content WHERE key = ${key} LIMIT 1`
    return (rows[0]?.value as any) ?? null
  }, null)
}

// ============================ CONTACT / WAITLIST ============================

export async function getContactMessages() {
  return safeRead(async () => (await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200`) as any[], [] as any[])
}

export async function getWaitlist() {
  return safeRead(async () => (await sql`SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 200`) as any[], [] as any[])
}

// ============================ REPORTS ============================

export async function getReportData(from: string, to: string) {
  return safeRead(async () => {
    const bookings = await sql`
      SELECT b.reference, b.guest_name, b.guest_email, r.name AS room_name,
             b.check_in, b.check_out, b.nights, b.guests, b.total, b.status, b.source, b.created_at
      FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.created_at::date BETWEEN ${from} AND ${to}
      ORDER BY b.created_at DESC
    `
    const [summary] = await sql`
      SELECT COUNT(*) FILTER (WHERE status != 'cancelled') AS bookings,
             COUNT(*) FILTER (WHERE status = 'cancelled') AS cancellations,
             COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'),0) AS revenue,
             COALESCE(SUM(nights) FILTER (WHERE status != 'cancelled'),0) AS room_nights,
             COALESCE(AVG(total) FILTER (WHERE status != 'cancelled'),0) AS avg_booking_value
      FROM bookings WHERE created_at::date BETWEEN ${from} AND ${to}
    `
    return {
      bookings: bookings as any[],
      summary: {
        bookings: Number(summary.bookings),
        cancellations: Number(summary.cancellations),
        revenue: Number(summary.revenue),
        roomNights: Number(summary.room_nights),
        avgBookingValue: Number(summary.avg_booking_value),
      },
    }
  }, { bookings: [] as any[], summary: { bookings: 0, cancellations: 0, revenue: 0, roomNights: 0, avgBookingValue: 0 } })
}
