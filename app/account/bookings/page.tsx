import Link from "next/link"
import { CalendarCheck, Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserBookings, splitBookings } from "@/lib/account"
import { BookingCard } from "@/components/account/booking-card"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Upcoming stays" }

export default async function UpcomingBookingsPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const bookings = await getUserBookings(user.id as string)
  const { upcoming } = splitBookings(bookings)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Upcoming stays</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your confirmed and pending reservations.</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/book"><Plus className="size-4" /> New booking</Link>
        </Button>
      </header>

      {upcoming.length === 0 ? (
        <div className="glass glass-reflect rounded-3xl p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">No upcoming stays</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            When you book a room, your upcoming reservations will appear here.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href="/book">Book your stay</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {upcoming.map((b) => (
            <BookingCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </div>
  )
}
