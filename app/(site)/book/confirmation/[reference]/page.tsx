import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, CalendarDays, Users, BedDouble, Mail, MessageCircle, Home } from "lucide-react"
import { sql } from "@/lib/db"
import { usd, formatDate } from "@/lib/format"
import { whatsappLink, bookingWhatsappMessage } from "@/lib/whatsapp"
import { Reveal } from "@/components/site/reveal"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function ConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params
  const rows = await sql`
    SELECT b.*, r.name AS room_name
    FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
    WHERE b.reference = ${reference} LIMIT 1
  `
  const b = rows[0]
  if (!b) notFound()

  const waHref = whatsappLink(
    bookingWhatsappMessage({
      reference: b.reference,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      guestPhone: b.guest_phone,
      roomName: b.room_name ?? "Room",
      checkIn: b.check_in,
      checkOut: b.check_out,
      guests: b.guests,
      total: usd(b.total),
      specialRequests: b.special_requests,
    }),
  )

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-32">
      <Reveal>
        <div className="glass-strong glass-reflect rounded-3xl p-8 text-center sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold">Booking confirmed</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you, {b.guest_name.split(" ")[0]}. A confirmation has been sent to {b.guest_email}.
          </p>
          <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-primary/5 px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Booking reference</span>
            <span className="font-display text-2xl font-semibold">{b.reference}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="glass glass-reflect mt-6 rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold">Reservation details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Detail icon={<BedDouble className="size-4 text-primary" />} label="Room" value={b.room_name ?? "—"} />
            <Detail icon={<CalendarDays className="size-4 text-primary" />} label="Check-in" value={`${formatDate(b.check_in)} · from 2:00 PM`} />
            <Detail icon={<CalendarDays className="size-4 text-primary" />} label="Check-out" value={`${formatDate(b.check_out)} · by 11:00 AM`} />
            <Detail icon={<Users className="size-4 text-primary" />} label="Guests" value={String(b.guests)} />
            <div className="my-3 h-px bg-border" />
            <Detail label="Nights" value={String(b.nights)} />
            <Detail label="Room rate" value={`${usd(b.room_rate)} / night`} />
            <Detail label="Taxes & fees" value={usd(b.tax)} />
            <div className="flex items-center justify-between pt-1">
              <dt className="font-display text-base font-semibold">Total</dt>
              <dd className="font-display text-xl font-semibold">{usd(b.total)}</dd>
            </div>
            <p className="text-xs text-muted-foreground">Payment: Pay at the hotel</p>
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild className="rounded-xl bg-[#25D366] text-white hover:bg-[#1ebe5b]">
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> Confirm on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/account/bookings">
                <Mail className="size-4" /> View my bookings
              </Link>
            </Button>
          </div>
          <Button asChild variant="ghost" className="mt-3 w-full">
            <Link href="/"><Home className="size-4" /> Back to home</Link>
          </Button>
        </div>
      </Reveal>
    </div>
  )
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">{icon}{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
