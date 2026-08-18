import Link from "next/link"
import { getBookings } from "@/lib/admin"
import { money, formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const FILTERS = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"]

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status = "all", q = "" } = await searchParams
  const bookings = await getBookings({ status, search: q })

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${bookings.length} reservation(s)`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/bookings?status=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              status === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.replace("_", " ")}
          </Link>
        ))}
        <form className="ml-auto" action="/admin/bookings">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, ref…"
            className="h-8 w-56 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No bookings match this filter.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id} className="cursor-default">
                  <TableCell className="font-mono text-xs">
                    <Link href={`/admin/bookings/${b.reference}`} className="text-primary hover:underline">
                      {b.reference}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="block font-medium text-foreground">{b.guest_name}</span>
                    <span className="text-xs text-muted-foreground">{b.guest_email}</span>
                  </TableCell>
                  <TableCell className="text-sm">{b.room_name || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    <span className="block">{b.nights} night(s)</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{money(Number(b.total))}</TableCell>
                  <TableCell><StatusBadge status={b.payment_status} /></TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
