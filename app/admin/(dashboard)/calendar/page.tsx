import Link from "next/link"
import { getAdminRooms, getCalendarBookings } from "@/lib/admin"
import { PageHeader } from "@/components/admin/page-header"

const DAYS = 21

function ymd(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function CalendarPage() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + DAYS)

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })

  const [rooms, bookings] = await Promise.all([
    getAdminRooms(),
    getCalendarBookings(ymd(start), ymd(end)),
  ])

  // Index bookings by room for quick lookup.
  const byRoom = new Map<string, any[]>()
  for (const b of bookings) {
    if (!b.room_id) continue
    const list = byRoom.get(b.room_id) ?? []
    list.push(b)
    byRoom.set(b.room_id, list)
  }

  const occupiedOn = (roomId: string, day: Date) => {
    const list = byRoom.get(roomId) ?? []
    const dstr = ymd(day)
    return list.find((b) => ymd(new Date(b.check_in)) <= dstr && dstr < ymd(new Date(b.check_out)))
  }

  return (
    <div>
      <PageHeader title="Calendar" subtitle={`Room availability · next ${DAYS} days`} />

      <div className="flex items-center gap-4 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-primary/80" /> Occupied</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-500/60" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-border bg-card" /> Available</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[9rem] border-b border-r border-border bg-card p-2 text-left font-medium text-muted-foreground">
                Room
              </th>
              {days.map((d) => {
                const weekend = d.getDay() === 0 || d.getDay() === 6
                return (
                  <th
                    key={ymd(d)}
                    className={`border-b border-border p-1 text-center font-medium ${weekend ? "bg-muted/60" : ""}`}
                  >
                    <span className="block text-muted-foreground">{d.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                    <span className="text-foreground">{d.getDate()}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={DAYS + 1} className="p-8 text-center text-muted-foreground">No rooms configured.</td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td className="sticky left-0 z-10 border-r border-border bg-card p-2 align-top">
                    <span className="block font-medium text-foreground">{room.name}</span>
                    <span className="text-[0.65rem] text-muted-foreground">{room.total_units} unit(s)</span>
                  </td>
                  {days.map((d) => {
                    const b = occupiedOn(room.id, d)
                    const weekend = d.getDay() === 0 || d.getDay() === 6
                    const bg = b
                      ? b.status === "pending"
                        ? "bg-amber-500/60"
                        : "bg-primary/80"
                      : weekend
                        ? "bg-muted/40"
                        : ""
                    return (
                      <td key={ymd(d)} className="border-l border-border/50 p-0.5 text-center">
                        {b ? (
                          <Link
                            href={`/admin/bookings/${b.reference}`}
                            title={`${b.guest_name} — ${b.status}`}
                            className={`block h-7 rounded ${bg} transition-opacity hover:opacity-80`}
                          />
                        ) : (
                          <div className={`h-7 rounded ${bg}`} />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
