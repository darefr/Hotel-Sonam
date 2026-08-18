import { getWaitlist } from "@/lib/admin"
import { formatDate } from "@/lib/format"
import { updateWaitlistStatus } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ActionButton } from "@/components/admin/action-form"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

export default async function WaitlistPage() {
  const entries = await getWaitlist()

  return (
    <div>
      <PageHeader title="Waitlist" subtitle={`${entries.length} request(s)`} />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Preference</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  The waitlist is empty.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <span className="block font-medium text-foreground">{w.guest_name}</span>
                    <span className="text-xs text-muted-foreground">{w.email || w.phone || "—"}</span>
                  </TableCell>
                  <TableCell className="text-sm">{w.room_preference || "Any"} · {w.guests} guest(s)</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {w.requested_from ? formatDate(w.requested_from) : "—"} → {w.requested_to ? formatDate(w.requested_to) : "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {w.status !== "contacted" ? (
                        <ActionButton action={updateWaitlistStatus} fields={{ id: w.id, status: "contacted" }} size="sm" variant="outline">Contacted</ActionButton>
                      ) : null}
                      {w.status !== "converted" ? (
                        <ActionButton action={updateWaitlistStatus} fields={{ id: w.id, status: "converted" }} size="sm">Converted</ActionButton>
                      ) : null}
                      {w.status !== "closed" ? (
                        <ActionButton action={updateWaitlistStatus} fields={{ id: w.id, status: "closed" }} size="sm" variant="ghost">Close</ActionButton>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
