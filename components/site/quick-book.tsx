"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { CalendarDays, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

function today(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export function QuickBook() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState(today(1))
  const [checkOut, setCheckOut] = useState(today(3))
  const [guests, setGuests] = useState(2)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) })
    router.push(`/book?${params.toString()}`)
  }

  return (
    <form
      onSubmit={submit}
      className="glass-strong glass-reflect grid w-full grid-cols-1 gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
    >
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" /> Check-in
        </span>
        <input
          type="date"
          value={checkIn}
          min={today()}
          onChange={(e) => setCheckIn(e.target.value)}
          className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" /> Check-out
        </span>
        <input
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5" /> Guests
        </span>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <Button type="submit" className="h-[42px] w-full rounded-xl px-6 lg:w-auto">
          <Search className="size-4" /> Search
        </Button>
      </div>
    </form>
  )
}
