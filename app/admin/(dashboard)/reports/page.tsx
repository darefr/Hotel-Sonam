import { getReportData } from "@/lib/admin"
import { money, formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/status-badge"
import { ExportCsvButton } from "@/components/admin/export-csv-button"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

function ymd(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const sp = await searchParams
  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const from = sp.from || ymd(monthAgo)
  const to = sp.to || ymd(today)

  const { bookings, summary } = await getReportData(from, to)

  const exportRows = bookings.map((b: any) => ({
    reference: b.reference,
    guest: b.guest_name,
    email: b.guest_email,
    room: b.room_name || "",
    check_in: ymd(new Date(b.check_in)),
    check_out: ymd(new Date(b.check_out)),
    nights: b.nights,
    guests: b.guests,
    total: Number(b.total),
    status: b.status,
    source: b.source,
    booked_on: ymd(new Date(b.created_at)),
  }))

  return (
    <div>
      <PageHeader title="Reports" subtitle={`${formatDate(from)} — ${formatDate(to)}`}>
        <ExportCsvButton rows={exportRows} filename={`tukuche-report-${from}-to-${to}.csv`} />
      </PageHeader>

      <form action="/admin/reports" className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <label htmlFor="from" className="text-xs font-medium text-muted-foreground">From</label>
          <input id="from" name="from" type="date" defaultValue={from}
            className="block h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-xs font-medium text-muted-foreground">To</label>
          <input id="to" name="to" type="date" defaultValue={to}
            className="block h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Button type="submit">Run report</Button>
      </form>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Revenue" value={money(summary.revenue)} accent />
        <StatCard label="Bookings" value={summary.bookings} />
        <StatCard label="Room nights" value={summary.roomNights} />
        <StatCard label="Avg. value" value={money(Math.round(summary.avgBookingValue))} />
        <StatCard label="Cancellations" value={summary.cancellations} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Booked</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No bookings in this period.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b: any) => (
                <TableRow key={b.reference}>
                  <TableCell className="font-mono text-xs">{b.reference}</TableCell>
                  <TableCell>{b.guest_name}</TableCell>
                  <TableCell className="text-sm">{b.room_name || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(b.created_at)}</TableCell>
                  <TableCell className="text-right font-medium">{money(Number(b.total))}</TableCell>
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
