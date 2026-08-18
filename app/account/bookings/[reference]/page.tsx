import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Users, BedDouble, Sparkles } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getBookingByReference } from "@/lib/account"
import { usd, formatDate } from "@/lib/format"
import { CancelBooking } from "@/components/account/cancel-booking"
import { WhatsAppButton } from "@/components/account/whatsapp-button"

export const metadata = { title: "Booking details" }

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500",
  confirmed: "bg-primary/15 text-primary",
  checked_in: "bg-blue-500/15 text-blue-400",
  checked_out: "bg-foreground/10 text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
}

function canCancel(b: any) {
  if (!["pending", "confirmed"].includes(b.status)) return false
  const hoursUntil = (new Date(b.check_in + "T00:00:00").getTime() - Date.now()) / 3_600_000
  return hoursUntil >= 72
}

export default async function BookingDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params
  const user = await getCurrentUser()
  if (!user) return null
  const b = await getBookingByReference(reference, user.id as string)
  if (!b) notFound()

  return (
    <div className="space-y-6">
      <Link href="/account/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="glass-strong glass-reflect overflow-hidden rounded-3xl">
        <div className="relative h-48 w-full sm:h-60">
          <Image src={b.room_images?.[0] || "/images/room-deluxe.png"} alt={b.room_name ?? "Room"} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-white/80">Ref {b.reference}</p>
              <h1 className="font-display text-2xl font-semibold text-white">{b.room_name}</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[b.status] ?? "bg-white/20 text-white"}`}>
              {b.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Detail icon={<CalendarDays className="size-4 text-primary" />} label="Check-in" value={`${formatDate(b.check_in)} · from 2:00 PM`} />
          <Detail icon={<CalendarDays className="size-4 text-primary" />} label="Check-out" value={`${formatDate(b.check_out)} · by 11:00 AM`} />
          <Detail icon={<Users className="size-4 text-primary" />} label="Guests" value={String(b.guests)} />
          <Detail icon={<BedDouble className="size-4 text-primary" />} label="Nights" value={String(b.nights)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="glass glass-reflect rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Guest & requests</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={b.guest_name} />
            <Row label="Email" value={b.guest_email} />
            <Row label="Phone" value={b.guest_phone ?? "—"} />
            <Row label="Special requests" value={b.special_requests || "None"} />
            <Row label="Booked on" value={formatDate(b.created_at)} />
          </dl>
        </div>

        <aside className="glass glass-reflect h-fit rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Payment</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row label={`${usd(b.room_rate)} × ${b.nights} nights`} value={usd(b.subtotal)} />
            <Row label="Taxes & fees" value={usd(b.tax)} />
          </dl>
          <div className="my-4 h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Total</span>
            <span className="font-display text-xl font-semibold">{usd(b.total)}</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Pay at the hotel
          </p>

          <div className="mt-5 space-y-3">
            <WhatsAppButton
              booking={{
                reference: b.reference,
                guestName: b.guest_name,
                guestEmail: b.guest_email,
                guestPhone: b.guest_phone,
                roomName: b.room_name ?? "Room",
                checkIn: b.check_in,
                checkOut: b.check_out,
                guests: b.guests,
                total: Number(b.total),
                specialRequests: b.special_requests,
              }}
            />
            {canCancel(b) && <CancelBooking reference={b.reference} />}
          </div>
          {["pending", "confirmed"].includes(b.status) && !canCancel(b) && (
            <p className="mt-3 text-xs text-muted-foreground">
              Free cancellation window has passed. Contact the hotel for assistance.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
