import Link from "next/link"
import Image from "next/image"
import { CalendarCheck, Moon, Wallet, Sparkles, ArrowRight, Plus, Star } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserBookings, splitBookings, getGuestStats, getReviewableStays } from "@/lib/account"
import { usd, formatDate, daysUntil, tierProgress } from "@/lib/format"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Overview" }

export default async function AccountOverview() {
  const user = await getCurrentUser()
  if (!user) return null

  const [bookings, stats, reviewable] = await Promise.all([
    getUserBookings(user.id as string),
    getGuestStats(user.id as string),
    getReviewableStays(user.id as string),
  ])
  const { upcoming } = splitBookings(bookings)
  const next = upcoming[0]
  const points = Number(user.loyalty_points ?? 0)
  const progress = tierProgress(points)
  const firstName = (user.name as string).split(" ")[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold">{firstName}</h1>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/book"><Plus className="size-4" /> New booking</Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CalendarCheck className="size-5" />} label="Total bookings" value={String(stats.total_bookings)} />
        <StatCard icon={<Moon className="size-5" />} label="Nights stayed" value={String(stats.total_nights)} />
        <StatCard icon={<Wallet className="size-5" />} label="Lifetime value" value={usd(stats.total_spent)} />
        <StatCard icon={<Sparkles className="size-5" />} label="Loyalty points" value={points.toLocaleString()} />
      </div>

      {/* Next stay */}
      <section className="glass glass-reflect overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-display text-lg font-semibold">Your next stay</h2>
          {upcoming.length > 0 && (
            <Link href="/account/bookings" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          )}
        </div>
        {next ? (
          <div className="flex flex-col gap-4 p-6 sm:flex-row">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-56">
              <Image
                src={next.room_images?.[0] || "/images/room-deluxe.png"}
                alt={next.room_name ?? "Room"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold">{next.room_name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Ref {next.reference}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  In {daysUntil(next.check_in)} days
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Check-in</dt>
                  <dd className="font-medium">{formatDate(next.check_in)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Check-out</dt>
                  <dd className="font-medium">{formatDate(next.check_out)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Guests</dt>
                  <dd className="font-medium">{next.guests}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-medium">{usd(next.total)}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-4">
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href={`/account/bookings/${next.reference}`}>
                    Manage booking <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-muted-foreground">You have no upcoming stays.</p>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/book">Plan your escape <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        )}
      </section>

      {/* Loyalty progress */}
      <section className="glass glass-reflect rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Loyalty</h2>
          <Link href="/account/loyalty" className="text-sm font-medium text-primary hover:underline">Details</Link>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold">{progress.current}</span>
          {progress.next && <span className="text-muted-foreground">{progress.next} at {progress.nextAt?.toLocaleString()} pts</span>}
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
        {progress.next && progress.nextAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            {(progress.nextAt - points).toLocaleString()} points to {progress.next}
          </p>
        )}
      </section>

      {/* Review prompt */}
      {reviewable.length > 0 && (
        <section className="glass glass-reflect rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-amber-400" />
            <h2 className="font-display text-lg font-semibold">Share your experience</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You have {reviewable.length} recent {reviewable.length === 1 ? "stay" : "stays"} to review.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
            <Link href="/account/reviews">Write a review <ArrowRight className="size-4" /></Link>
          </Button>
        </section>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass glass-reflect rounded-3xl p-5">
      <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
