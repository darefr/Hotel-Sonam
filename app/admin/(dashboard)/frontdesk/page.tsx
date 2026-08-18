import Link from "next/link"
import { LogIn, LogOut, BedDouble } from "lucide-react"
import { getArrivalsDepartures, getAdminRooms } from "@/lib/admin"
import { money, formatDate } from "@/lib/format"
import { updateBookingStatus } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ActionButton } from "@/components/admin/action-form"
import { WalkInDialog } from "@/components/admin/walk-in-dialog"

export default async function FrontDeskPage() {
  const [{ arrivals, departures, inHouse }, rooms] = await Promise.all([
    getArrivalsDepartures(),
    getAdminRooms(),
  ])
  const activeRooms = rooms
    .filter((r) => r.status === "active")
    .map((r) => ({ id: r.id, name: r.name, price: Number(r.price) }))

  return (
    <div>
      <PageHeader title="Front Desk" subtitle="Today's arrivals, departures and in-house guests">
        <WalkInDialog rooms={activeRooms} />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Column title="Arrivals" icon={LogIn} count={arrivals.length}>
          {arrivals.length === 0 ? (
            <Empty>No arrivals today.</Empty>
          ) : (
            arrivals.map((b) => (
              <GuestCard key={b.id} b={b}>
                <ActionButton action={updateBookingStatus} fields={{ id: b.id, status: "checked_in" }} size="sm">
                  Check in
                </ActionButton>
              </GuestCard>
            ))
          )}
        </Column>

        <Column title="In-house" icon={BedDouble} count={inHouse.length}>
          {inHouse.length === 0 ? (
            <Empty>No guests in-house.</Empty>
          ) : (
            inHouse.map((b) => (
              <GuestCard key={b.id} b={b}>
                <span className="text-xs text-muted-foreground">Departs {formatDate(b.check_out)}</span>
              </GuestCard>
            ))
          )}
        </Column>

        <Column title="Departures" icon={LogOut} count={departures.length}>
          {departures.length === 0 ? (
            <Empty>No departures today.</Empty>
          ) : (
            departures.map((b) => (
              <GuestCard key={b.id} b={b}>
                <ActionButton
                  action={updateBookingStatus}
                  fields={{ id: b.id, status: "checked_out" }}
                  size="sm"
                  variant="outline"
                >
                  Check out
                </ActionButton>
              </GuestCard>
            ))
          )}
        </Column>
      </div>
    </div>
  )
}

function Column({
  title, icon: Icon, count, children,
}: {
  title: string; icon: React.ComponentType<{ className?: string }>; count: number; children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function GuestCard({ b, children }: { b: any; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/admin/bookings/${b.reference}`} className="block truncate font-medium text-foreground hover:underline">
            {b.guest_name}
          </Link>
          <p className="text-xs text-muted-foreground">{b.room_name || "Unassigned"} · {b.guests} guest(s)</p>
          <p className="text-xs text-muted-foreground">{money(Number(b.total))} · {b.nights} night(s)</p>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div className="mt-2 flex items-center justify-end">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
}
