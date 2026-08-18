import { History } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserBookings, splitBookings } from "@/lib/account"
import { BookingCard } from "@/components/account/booking-card"

export const metadata = { title: "Booking history" }

export default async function HistoryPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const bookings = await getUserBookings(user.id as string)
  const { past } = splitBookings(bookings)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Booking history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Past stays, completed and cancelled reservations.</p>
      </header>

      {past.length === 0 ? (
        <div className="glass glass-reflect rounded-3xl p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <History className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">No history yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Your completed stays will be listed here after checkout.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {past.map((b) => (
            <BookingCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </div>
  )
}
