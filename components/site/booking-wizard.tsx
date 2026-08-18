"use client"

import Image from "next/image"
import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Users, Check, Loader2, BedDouble, Maximize, ArrowRight, ArrowLeft } from "lucide-react"
import { searchAvailability, createBooking, type BookingState } from "@/lib/actions/booking"
import type { AvailableRoom } from "@/lib/bookings"
import { usd } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const TAX_RATE = 0.13

function today(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function nightsBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00")
  const d2 = new Date(b + "T00:00:00")
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86_400_000))
}

type Props = {
  initial: { room?: string; checkIn?: string; checkOut?: string; guests?: number }
  user: { name: string; email: string; phone: string | null } | null
}

function ConfirmButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Confirming…" : "Confirm booking"}
    </Button>
  )
}

export function BookingWizard({ initial, user }: Props) {
  const [step, setStep] = useState(1)
  const [checkIn, setCheckIn] = useState(initial.checkIn || today(1))
  const [checkOut, setCheckOut] = useState(initial.checkOut || today(3))
  const [guests, setGuests] = useState(initial.guests || 2)
  const [rooms, setRooms] = useState<AvailableRoom[]>([])
  const [selected, setSelected] = useState<AvailableRoom | null>(null)
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const [state, action] = useActionState<BookingState, FormData>(createBooking, {})

  const nights = nightsBetween(checkIn, checkOut)

  const quote = useMemo(() => {
    if (!selected) return null
    const rate = Number(selected.price)
    const subtotal = rate * nights
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    return { rate, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 }
  }, [selected, nights])

  function runSearch(preselectSlug?: string) {
    setSearchError(null)
    startTransition(async () => {
      const res = await searchAvailability(checkIn, checkOut, guests)
      if (res.error) {
        setSearchError(res.error)
        setRooms([])
        return
      }
      setRooms(res.rooms)
      setSearched(true)
      if (preselectSlug) {
        const match = res.rooms.find((r) => r.slug === preselectSlug && r.available > 0)
        if (match) {
          setSelected(match)
          setStep(3)
          return
        }
      }
      setStep(2)
    })
  }

  // Auto-run search on mount when arriving with params.
  useEffect(() => {
    if (initial.checkIn || initial.room) runSearch(initial.room)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {/* STEP 1 — dates & guests */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="glass glass-reflect mt-6 rounded-3xl p-6 sm:p-8"
            >
              <h2 className="font-display text-xl font-semibold">When would you like to stay?</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="size-3.5" /> Check-in
                  </span>
                  <Input type="date" value={checkIn} min={today()} onChange={(e) => setCheckIn(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="size-3.5" /> Check-out
                  </span>
                  <Input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5" /> Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </label>
              </div>
              {searchError && <p className="mt-4 text-sm text-destructive">{searchError}</p>}
              <Button onClick={() => runSearch()} disabled={pending} size="lg" className="mt-6 rounded-xl">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {pending ? "Searching…" : "Search availability"}
              </Button>
            </motion.div>
          )}

          {/* STEP 2 — choose room */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">
                  {nights} {nights === 1 ? "night" : "nights"} · {guests} {guests === 1 ? "guest" : "guests"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Change dates
                </Button>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                {rooms.length === 0 && (
                  <div className="glass rounded-3xl p-8 text-center text-muted-foreground">
                    No rooms match those dates and guests. Try adjusting your search.
                  </div>
                )}
                {rooms.map((r) => {
                  const soldOut = r.available <= 0
                  return (
                    <div key={r.id} className={`glass glass-reflect flex flex-col overflow-hidden rounded-3xl sm:flex-row ${soldOut ? "opacity-60" : ""}`}>
                      <div className="relative h-40 sm:h-auto sm:w-56">
                        <Image src={r.images?.[0] || "/images/room-deluxe.png"} alt={r.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="size-3.5 text-primary" /> {r.capacity}</span>
                              {r.beds && <span className="flex items-center gap-1"><BedDouble className="size-3.5 text-primary" /> {r.beds}</span>}
                              {r.size_sqm && <span className="flex items-center gap-1"><Maximize className="size-3.5 text-primary" /> {r.size_sqm} m²</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-xl font-semibold">{usd(r.price)}</p>
                            <p className="text-xs text-muted-foreground">/ night</p>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-xs font-medium ${soldOut ? "text-destructive" : r.available <= 2 ? "text-amber-500" : "text-primary"}`}>
                            {soldOut ? "Sold out for these dates" : `${r.available} left · ${usd(Number(r.price) * nights)} total`}
                          </span>
                          <Button
                            size="sm"
                            className="rounded-xl"
                            disabled={soldOut}
                            onClick={() => { setSelected(r); setStep(3) }}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3 — guest details */}
          {step === 3 && selected && (
            <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Guest details</h2>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="size-4" /> Change room
                </Button>
              </div>
              <form action={action} className="glass glass-reflect mt-5 rounded-3xl p-6 sm:p-8">
                <input type="hidden" name="roomId" value={selected.id} />
                <input type="hidden" name="checkIn" value={checkIn} />
                <input type="hidden" name="checkOut" value={checkOut} />
                <input type="hidden" name="guests" value={guests} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="guestName">Full name</Label>
                    <Input id="guestName" name="guestName" required defaultValue={user?.name ?? ""} placeholder="Your full name" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="guestEmail">Email</Label>
                    <Input id="guestEmail" name="guestEmail" type="email" required defaultValue={user?.email ?? ""} placeholder="you@example.com" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="guestPhone">Phone</Label>
                    <Input id="guestPhone" name="guestPhone" defaultValue={user?.phone ?? ""} placeholder="+977 …" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <Label htmlFor="specialRequests">Special requests (optional)</Label>
                  <Textarea id="specialRequests" name="specialRequests" rows={3} placeholder="Early check-in, dietary needs, celebrations…" />
                </div>
                {state.error && <p className="mt-4 text-sm text-destructive">{state.error}</p>}
                <div className="mt-6">
                  <ConfirmButton />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    No prepayment required · Pay at the hotel · Free cancellation up to 72h before check-in
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="glass-strong glass-reflect rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold">Your stay</h3>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row label="Check-in" value={checkIn} />
            <Row label="Check-out" value={checkOut} />
            <Row label="Nights" value={String(nights)} />
            <Row label="Guests" value={String(guests)} />
            <Row label="Room" value={selected?.name ?? "Not selected"} />
          </dl>
          {quote && (
            <>
              <div className="my-4 h-px bg-border" />
              <dl className="space-y-2.5 text-sm">
                <Row label={`${usd(quote.rate)} × ${nights} nights`} value={usd(quote.subtotal)} />
                <Row label="Taxes & fees (13%)" value={usd(quote.tax)} />
              </dl>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold">{usd(quote.total)}</span>
              </div>
            </>
          )}
          <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="size-3.5 text-primary" /> Instant confirmation</li>
            <li className="flex items-center gap-2"><Check className="size-3.5 text-primary" /> Best-rate guarantee</li>
            <li className="flex items-center gap-2"><Check className="size-3.5 text-primary" /> Loyalty points on every stay</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const steps = ["Dates", "Room", "Details"]
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const n = i + 1
        const active = step === n
        const done = step > n
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/15 text-primary" : "glass text-muted-foreground"}`}>
              <span className="grid size-5 place-items-center rounded-full bg-background/30 text-xs">{done ? <Check className="size-3" /> : n}</span>
              {s}
            </div>
            {i < steps.length - 1 && <div className="h-px w-4 bg-border sm:w-8" />}
          </div>
        )
      })}
    </div>
  )
}
