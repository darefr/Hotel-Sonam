import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Users, ArrowRight } from "lucide-react"
import { usd, formatDate } from "@/lib/format"

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500",
  confirmed: "bg-primary/15 text-primary",
  checked_in: "bg-blue-500/15 text-blue-400",
  checked_out: "bg-foreground/10 text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Completed",
  cancelled: "Cancelled",
}

export function BookingCard({ b }: { b: any }) {
  return (
    <div className="glass glass-reflect flex flex-col overflow-hidden rounded-3xl sm:flex-row">
      <div className="relative h-36 w-full sm:h-auto sm:w-48">
        <Image src={b.room_images?.[0] || "/images/room-deluxe.png"} alt={b.room_name ?? "Room"} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">{b.room_name ?? "Room"}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Ref {b.reference}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[b.status] ?? "bg-foreground/10"}`}>
            {statusLabel[b.status] ?? b.status}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-primary" />
            {formatDate(b.check_in)} → {formatDate(b.check_out)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" /> {b.guests} · {b.nights} {b.nights === 1 ? "night" : "nights"}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-lg font-semibold">{usd(b.total)}</span>
          <Link
            href={`/account/bookings/${b.reference}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View details <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
